const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Создаем директорию для аватаров, если она не существует
const avatarDir = path.join(__dirname, '../public/images/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    // Добавляем проверку типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и GIF.'));
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register route
router.post('/register', upload.single('avatar'), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get avatar path if file was uploaded
    const avatarPath = req.file ? `/images/avatars/${req.file.filename}` : null;

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, avatar, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, avatar, role',
      [name, email, hashedPassword, avatarPath, 'user']
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  try {
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('User query result:', {
      found: result.rows.length > 0,
      user: result.rows[0] ? {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        passwordHash: result.rows[0].password
      } : null
    });

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password check:', { 
      inputPassword: password,
      storedHash: user.password,
      isValid: validPassword 
    });

    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('Login successful:', {
      userId: user.id,
      role: user.role
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Ошибка при входе в систему' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о пользователе' });
  }
});

// Обновление профиля
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email) {
      // Проверяем, не занят ли email другим пользователем
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email уже используется' });
      }

      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (currentPassword && newPassword) {
      // Проверяем текущий пароль
      const validPassword = await bcrypt.compare(currentPassword, req.user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Неверный текущий пароль' });
      }

      // Хешируем новый пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      updateFields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    values.push(req.user.id);
    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, name, email, role, avatar`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

// Загрузка аватара
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }

  try {
    const avatarPath = `/images/avatars/${req.file.filename}`;
    
    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, email, role, avatar',
      [avatarPath, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Ошибка при загрузке аватара' });
  }
});

module.exports = router; 