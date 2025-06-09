const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const config = require('./config');
const securityMiddleware = require('./middleware/security');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const toursRoutes = require('./routes/tours');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');

const app = express();

// Use cors middleware with proper configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.fieldname === 'avatar' 
      ? path.join(__dirname, 'public', 'images', 'avatars')
      : path.join(__dirname, 'public', 'images', 'tours');
    
    // Создаем директорию, если она не существует
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Wrong file type');
      error.code = 'LIMIT_FILE_TYPES';
      return cb(error, false);
    }
    cb(null, true);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityMiddleware);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  console.log('Auth headers:', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Обновляем middleware для проверки прав администратора
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Требуются права администратора' });
  }
  next();
};

// Middleware для проверки прав руководителя туров
const isGuide = (req, res, next) => {
  if (req.user.role !== 'guide' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Требуются права руководителя туров' });
  }
  next();
};

// Обновляем маршрут регистрации
app.post('/api/auth/register', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Проверяем, существует ли пользователь
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Получаем путь к аватару, если файл был загружен
    const avatarPath = req.file ? `/images/avatars/${req.file.filename}` : null;

    // Устанавливаем роль (только админ может создавать руководителей туров)
    const userRole = role === 'guide' ? 'user' : (role || 'user');

    // Создаем пользователя
    const result = await pool.query(
      'INSERT INTO users (name, email, password, avatar, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, avatar, role',
      [name, email, hashedPassword, avatarPath, userRole]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

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
    console.error('Error in register:', error);
    if (error.code === 'LIMIT_FILE_TYPES') {
      return res.status(422).json({ message: 'Неподдерживаемый тип файла' });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(422).json({ message: 'Файл слишком большой (максимум 5MB)' });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршруты для туров
app.get('/api/tours', async (req, res) => {
  try {
    const { search, difficulty, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM tours WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (difficulty) {
      params.push(difficulty);
      query += ` AND difficulty = $${params.length}`;
    }

    if (minPrice) {
      params.push(minPrice);
      query += ` AND price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND price <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/tours', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      difficulty,
      duration,
      distance,
      price,
      guide_id,
    } = req.body;

    const imagePath = req.file ? `/images/tours/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO tours (name, description, difficulty, duration, distance, price, image, guide_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, difficulty, duration, distance, price, imagePath, guide_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.put('/api/tours/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      difficulty,
      duration,
      distance,
      price,
      guide_id,
    } = req.body;

    // Если загружено новое изображение, обновляем путь
    let imagePath = null;
    if (req.file) {
      imagePath = `/images/tours/${req.file.filename}`;
      
      // Получаем старое изображение для удаления
      const oldImage = await pool.query('SELECT image FROM tours WHERE id = $1', [id]);
      if (oldImage.rows[0]?.image) {
        const oldImagePath = path.join(__dirname, 'public', oldImage.rows[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updateQuery = imagePath
      ? 'UPDATE tours SET name = $1, description = $2, difficulty = $3, duration = $4, distance = $5, price = $6, image = $7, guide_id = $8 WHERE id = $9 RETURNING *'
      : 'UPDATE tours SET name = $1, description = $2, difficulty = $3, duration = $4, distance = $5, price = $6, guide_id = $7 WHERE id = $8 RETURNING *';

    const updateValues = imagePath
      ? [name, description, difficulty, duration, distance, price, imagePath, guide_id, id]
      : [name, description, difficulty, duration, distance, price, guide_id, id];

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Тур не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/api/tours/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tours WHERE id = $1', [id]);
    res.json({ message: 'Тур успешно удален' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршруты для заказов
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // Начинаем транзакцию
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Создаем заказ
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id',
        [userId, 'upcoming']
      );
      const orderId = orderResult.rows[0].id;

      // Добавляем туры в заказ
      for (const item of items) {
        await client.query(
          'INSERT INTO order_tours (order_id, tour_id, date) VALUES ($1, $2, $3)',
          [orderId, item.id, item.selectedDate]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Заказ успешно создан' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршруты для пользователей
app.get('/api/users/:id/tours/upcoming', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const result = await pool.query(
      `SELECT t.*, ot.date
       FROM tours t
       JOIN order_tours ot ON t.id = ot.tour_id
       JOIN orders o ON ot.order_id = o.id
       WHERE o.user_id = $1 AND o.status = 'upcoming'`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming tours:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/users/:id/tours/completed', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const result = await pool.query(
      `SELECT t.*, ot.date
       FROM tours t
       JOIN order_tours ot ON t.id = ot.tour_id
       JOIN orders o ON ot.order_id = o.id
       WHERE o.user_id = $1 AND o.status = 'completed'`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completed tours:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/users/:userId/tours/:tourId/complete', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId, tourId } = req.params;

    await pool.query(
      `UPDATE orders o
       SET status = 'completed'
       FROM order_tours ot
       WHERE o.id = ot.order_id
       AND o.user_id = $1
       AND ot.tour_id = $2
       AND o.status = 'upcoming'`,
      [userId, tourId]
    );

    res.json({ message: 'Тур отмечен как завершенный' });
  } catch (error) {
    console.error('Error completing tour:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавляем маршрут для обновления профиля
app.put('/api/users/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Получаем текущего пользователя
    const currentUser = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (currentUser.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const user = currentUser.rows[0];

    // Проверяем email на уникальность, если он изменился
    if (email !== user.email) {
      const emailExists = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Email уже используется' });
      }
    }

    // Формируем запрос на обновление
    let updateQuery = 'UPDATE users SET name = $1, email = $2';
    let queryParams = [name || user.name, email || user.email];
    let paramCount = 2;

    // Если загружен новый аватар
    if (req.file) {
      paramCount++;
      updateQuery += `, avatar = $${paramCount}`;
      queryParams.push(`/images/avatars/${req.file.filename}`);
    }

    // Если меняется пароль
    if (newPassword && currentPassword) {
      // Проверяем текущий пароль
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Неверный текущий пароль' });
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      paramCount++;
      updateQuery += `, password = $${paramCount}`;
      queryParams.push(hashedPassword);
    }

    // Добавляем условие WHERE и RETURNING
    updateQuery += ` WHERE id = $${paramCount + 1} RETURNING id, name, email, avatar, role`;
    queryParams.push(userId);

    // Выполняем обновление
    const result = await pool.query(updateQuery, queryParams);
    const updatedUser = result.rows[0];

    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Добавляем маршрут для изменения роли пользователя (только для админа)
app.put('/api/users/:userId/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['admin', 'guide', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Недопустимая роль' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Ошибка при обновлении роли пользователя' });
  }
});

// Добавляем маршрут для получения всех пользователей (только для админа)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar, role FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
}); 