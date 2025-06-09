const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки аватаров
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'images', 'avatars');
    // Создаем директорию, если она не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла. Разрешены только JPEG, PNG и GIF'));
    }
  }
});

// Получить список пользователей (только для админов)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// Получить список гидов
router.get('/guides', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, position, description, avatar FROM users WHERE role = $1',
      ['guide']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting guides:', error);
    res.status(500).json({ error: 'Ошибка при получении списка гидов' });
  }
});

// Получить пользователя по ID (только для админов)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о пользователе' });
  }
});

// Обновить роль пользователя (только для админов)
router.patch('/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Проверяем допустимые роли
  const validRoles = ['user', 'guide', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Недопустимая роль' });
  }

  try {
    // Проверяем, не пытаемся ли мы изменить роль администратора по умолчанию
    const userCheck = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (userCheck.rows[0].email === 'admin@example.com') {
      return res.status(403).json({ message: 'Невозможно изменить роль администратора по умолчанию' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, avatar',
      [role, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Ошибка при обновлении роли пользователя' });
  }
});

// Удалить пользователя (только для админов)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Проверяем, не пытается ли админ удалить самого себя
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Нельзя удалить свой собственный аккаунт' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

// Обновить профиль пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, position, description } = req.body;
    const userId = req.user.id;

    // Проверяем, не занят ли email другим пользователем
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Этот email уже используется' });
      }
    }

    // Формируем запрос динамически в зависимости от роли пользователя
    let query = 'UPDATE users SET ';
    const values = [];
    let paramCount = 1;
    const updates = [];

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    // Поля position и description доступны для гидов
    if (position !== undefined && req.user.role === 'guide') {
      updates.push(`position = $${paramCount}`);
      values.push(position);
      paramCount++;
    }
    
    if (description !== undefined && req.user.role === 'guide') {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Нет данных для обновления' });
    }

    query += updates.join(', ');
    query += ` WHERE id = $${paramCount} RETURNING id, name, email, role, avatar, position, description, created_at`;
    values.push(userId);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Загрузить аватар
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Avatar upload request:', {
      file: req.file,
      user: req.user,
      body: req.body
    });

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    // Получаем старый аватар пользователя
    const oldAvatarResult = await pool.query(
      'SELECT avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    console.log('Old avatar:', oldAvatarResult.rows[0]?.avatar);

    // Удаляем старый файл аватара, если он существует
    if (oldAvatarResult.rows[0]?.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../public', oldAvatarResult.rows[0].avatar);
      console.log('Trying to delete old avatar at:', oldAvatarPath);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
        console.log('Old avatar deleted');
      }
    }

    // Сохраняем путь к новому аватару в базе данных
    const avatarPath = `/images/avatars/${req.file.filename}`;
    console.log('New avatar path:', avatarPath);
    
    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, email, role, avatar, position, description, created_at',
      [avatarPath, req.user.id]
    );

    console.log('Update result:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    // Удаляем загруженный файл в случае ошибки
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Ошибка при загрузке аватара' });
  }
});

module.exports = router; 