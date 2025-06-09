const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Создание нового заказа
router.post('/', authenticateToken, async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Необходимо указать хотя бы один тур для заказа'
    });
  }

  try {
    await pool.query('BEGIN');

    for (const item of items) {
      // Проверяем наличие всех необходимых полей
      if (!item.id || !item.quantity || !item.price) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          message: 'Неверный формат данных заказа. Убедитесь, что указаны все необходимые поля'
        });
      }

      // Проверяем доступность мест
      const tourResult = await pool.query(
        'SELECT total_slots, name FROM tours WHERE id = $1',
        [item.id]
      );

      if (tourResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          message: `Тур с ID ${item.id} не найден`
        });
      }

      const tour = tourResult.rows[0];

      // Получаем общее количество заказанных мест
      const ordersResult = await pool.query(
        'SELECT COALESCE(SUM(quantity), 0) as total_ordered FROM orders WHERE tour_id = $1 AND status != $2',
        [item.id, 'cancelled']
      );

      const totalSlots = tour.total_slots;
      const totalOrdered = parseInt(ordersResult.rows[0].total_ordered);
      const remainingSlots = totalSlots - totalOrdered;

      if (remainingSlots < item.quantity) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          message: `Недостаточно мест для тура "${tour.name}". Доступно: ${remainingSlots}`
        });
      }

      // Создаем заказ
      await pool.query(
        'INSERT INTO orders (user_id, tour_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5)',
        [userId, item.id, item.quantity, item.price * item.quantity, 'pending']
      );

      // Обновляем количество доступных мест
      await pool.query(
        'UPDATE tours SET available_slots = available_slots - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'Заказ успешно создан' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Произошла ошибка при создании заказа. Пожалуйста, попробуйте позже.',
      error: error.message 
    });
  }
});

// Получение заказов пользователя
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.name as tour_name, t.image as tour_image, t.price as tour_price 
       FROM orders o 
       JOIN tours t ON o.tour_id = t.id 
       WHERE o.user_id = $1 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

// Получение всех заказов (для админов)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.name as tour_name, t.image as tour_image, 
              u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN tours t ON o.tour_id = t.id 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

// Обновление статуса заказа (для админов)
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query('BEGIN');

    // Получаем информацию о заказе
    const orderResult = await pool.query(
      'SELECT tour_id, quantity, status FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = orderResult.rows[0];

    // Обновляем статус заказа
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Если заказ отменяется, возвращаем места обратно в тур
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await pool.query(
        'UPDATE tours SET available_slots = available_slots + $1 WHERE id = $2',
        [order.quantity, order.tour_id]
      );
    }
    // Если заказ восстанавливается из отмененного, снова вычитаем места
    else if (status !== 'cancelled' && order.status === 'cancelled') {
      await pool.query(
        'UPDATE tours SET available_slots = available_slots - $1 WHERE id = $2',
        [order.quantity, order.tour_id]
      );
    }

    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса заказа' });
  }
});

// Получить количество заказов для тура
router.get('/tour/:id/count', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total_orders FROM orders WHERE tour_id = $1 AND status != $2',
      [id, 'cancelled']
    );

    res.json({ total_orders: parseInt(result.rows[0].total_orders) });
  } catch (error) {
    console.error('Error getting tour orders count:', error);
    res.status(500).json({ message: 'Ошибка при получении количества заказов' });
  }
});

module.exports = router; 