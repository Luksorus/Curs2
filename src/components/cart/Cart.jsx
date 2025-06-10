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

      
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }

     
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не найден токен авторизации');
      }

      
      const orderPromises = cartItems.map(async (item) => {
        const orderData = {
          tour_id: item.tour.id,
          number_of_people: item.quantity,
          total_price: item.tour.price * item.quantity
        };

        
        const response = await api.post('/api/orders', orderData);
        return response.data;
      });
      await Promise.all(orderPromises);
      clearCart();
      setSuccessMessage('Заказ успешно оформлен!');
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
      {}
    </div>
  );
};

export default Cart; 