import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Проверяем авторизацию
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }

      // Получаем токен из localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не найден токен авторизации');
      }

      // Создаем массив заказов для каждого тура
      const orderPromises = cartItems.map(async (item) => {
        const orderData = {
          tour_id: item.tour.id,
          number_of_people: item.quantity,
          total_price: item.tour.price * item.quantity
        };

        // Отправляем запрос на создание заказа с правильным путем /api/orders
        const response = await api.post('/api/orders', orderData);
        return response.data;
      });

      // Ждем выполнения всех заказов
      await Promise.all(orderPromises);

      // Очищаем корзину после успешного оформления
      clearCart();
      
      // Показываем сообщение об успехе
      setSuccessMessage('Заказ успешно оформлен!');
      
      // Перенаправляем на страницу профиля через 2 секунды
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('API Response Error:', error);
      setError(error.response?.data?.message || 'Произошла ошибка при оформлении заказа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default Cart; 