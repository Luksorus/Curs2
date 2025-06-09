const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware для проверки прав на управление турами
const canManageTours = (req, res, next) => {
  if (req.user.role !== 'guide' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора или руководителя туров' });
  }
  next();
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/tours'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Получить список пользователей с ролью guide
router.get('/guides', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar, position, description FROM users WHERE role = $1',
      ['guide']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting guides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить туры гида с информацией об участниках
router.get('/guide-tours', authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь является гидом
    if (req.user.role !== 'guide' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    console.log('Получение туров для гида:', req.user.id);

    // Получаем туры гида
    const toursResult = await pool.query(
      `SELECT t.*, 
              u.name as guide_name, 
              u.avatar as guide_avatar,
              u.position as guide_position
       FROM tours t
       LEFT JOIN users u ON t.guide_id = u.id
       WHERE t.guide_id = $1`,
      [req.user.id]
    );

    console.log('Найдено туров:', toursResult.rows.length);

    // Для каждого тура получаем информацию об участниках
    const toursWithParticipants = await Promise.all(
      toursResult.rows.map(async (tour) => {
        // Получаем всех участников, включая отмененные заказы
        const participantsResult = await pool.query(
          `SELECT 
            u.id as user_id,
            u.name as user_name,
            u.email as user_email,
            o.id as order_id,
            o.status as order_status,
            o.created_at as order_created,
            o.notes as order_notes,
            o.quantity as order_count,
            t.price as tour_price
          FROM orders o
          JOIN users u ON o.user_id = u.id
          JOIN tours t ON o.tour_id = t.id
          WHERE o.tour_id = $1
          ORDER BY 
            CASE 
              WHEN o.status = 'cancelled' THEN 1 
              ELSE 0 
            END,
            o.created_at DESC`,
          [tour.id]
        );

        // Считаем общее количество активных заказанных мест
        const totalOrderedSlots = participantsResult.rows
          .filter(p => p.order_status !== 'cancelled')
          .reduce((sum, p) => sum + parseInt(p.order_count), 0);

        return {
          ...tour,
          total_ordered_slots: totalOrderedSlots,
          is_full: totalOrderedSlots >= tour.total_slots,
          participants: participantsResult.rows
        };
      })
    );

    res.json(toursWithParticipants);
  } catch (error) {
    console.error('Error fetching guide tours:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о турах' });
  }
});

// Получить все туры
router.get('/', async (req, res) => {
  try {
    const { difficulty, location, minPrice, maxPrice, duration } = req.query;
    let query = `
      SELECT t.*, u.name as guide_name, u.position as guide_position 
      FROM tours t 
      LEFT JOIN users u ON t.guide_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (difficulty) {
      params.push(difficulty);
      query += ` AND t.difficulty = $${params.length}`;
    }

    if (location) {
      params.push(`%${location}%`);
      query += ` AND t.location ILIKE $${params.length}`;
    }

    if (minPrice) {
      params.push(parseFloat(minPrice));
      query += ` AND t.price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      query += ` AND t.price <= $${params.length}`;
    }

    if (duration) {
      params.push(parseInt(duration));
      query += ` AND t.duration = $${params.length}`;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting tours:', error);
    res.status(500).json({ error: 'Ошибка при получении списка туров' });
  }
});

// Получить тур по ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             u.id as guide_id, u.name as guide_name, 
             u.position as guide_position, u.avatar as guide_avatar,
             u.description as guide_description
      FROM tours t 
      LEFT JOIN users u ON t.guide_id = u.id 
      WHERE t.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тур не найден' });
    }

    const tour = result.rows[0];
    
    // Форматируем данные о гиде
    if (tour.guide_id) {
      tour.guide = {
        id: tour.guide_id,
        name: tour.guide_name,
        position: tour.guide_position,
        avatar: tour.guide_avatar,
        description: tour.guide_description
      };
    }

    // Удаляем лишние поля
    delete tour.guide_id;
    delete tour.guide_name;
    delete tour.guide_position;
    delete tour.guide_avatar;
    delete tour.guide_description;

    res.json(tour);
  } catch (error) {
    console.error('Error getting tour:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о туре' });
  }
});

// Создать новый тур (только для админов)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  const { 
    name, 
    description, 
    difficulty, 
    duration, 
    distance, 
    price, 
    location,
    guide_id,
    total_slots,
    available_slots
  } = req.body;

  try {
    const imagePath = req.file ? `/images/tours/${req.file.filename}` : null;

    const result = await pool.query(`
      INSERT INTO tours (
        name, description, difficulty, duration, 
        distance, price, location, image, guide_id,
        total_slots, available_slots
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `, [
      name, description, difficulty, duration, 
      distance, price, location, imagePath, guide_id,
      total_slots, available_slots
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: 'Ошибка при создании тура' });
  }
});

// Обновить тур (только для админов)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    difficulty, 
    duration, 
    distance, 
    price, 
    location,
    guide_id,
    total_slots,
    available_slots
  } = req.body;

  try {
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    const fields = {
      name, description, difficulty, duration, 
      distance, price, location, guide_id,
      total_slots, available_slots
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (req.file) {
      updateFields.push(`image = $${paramCount}`);
      values.push(`/images/tours/${req.file.filename}`);
      paramCount++;

      // Получаем старое изображение для удаления
      const oldImage = await pool.query('SELECT image FROM tours WHERE id = $1', [id]);
      if (oldImage.rows[0]?.image) {
        const oldImagePath = path.join(__dirname, '../public', oldImage.rows[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    values.push(id);
    const result = await pool.query(`
      UPDATE tours 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тур не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: 'Ошибка при обновлении тура' });
  }
});

// Удалить тур (только для админов)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tours WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тур не найден' });
    }

    res.json({ message: 'Тур успешно удален' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: 'Ошибка при удалении тура' });
  }
});

module.exports = router; 