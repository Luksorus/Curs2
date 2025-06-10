import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../api/axios';
import { getImageUrl } from '../../config';

const Container = styled.div`
  padding: 2rem;
  overflow-x: auto;
`;

const OrdersTable = styled.table`
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 2rem;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
  }

  td {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;

  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
      case 'confirmed':
        return 'background: #d4edda; color: #155724;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 0.5rem;
  white-space: nowrap;
  
  ${props => {
    if (props.confirm) {
      return 'background: #28a745; color: white; &:hover { background: #218838; }';
    } else if (props.cancel) {
      return 'background: #dc3545; color: white; &:hover { background: #c82333; }';
    }
    return 'background: #6c757d; color: white; &:hover { background: #5a6268; }';
  }}

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
  }
`;

const TourImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
`;

const ActionCell = styled.td`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 200px;
`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Обновляем список заказов
      setError(null);
    } catch (err) {
      setError('Ошибка при обновлении статуса заказа');
      console.error('Error updating order status:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Container>
      <h2>Управление заказами</h2>
      <OrdersTable>
        <thead>
          <tr>
            <th>Тур</th>
            <th>Клиент</th>
            <th>Количество</th>
            <th>Сумма</th>
            <th>Дата заказа</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <TourImage src={getImageUrl(order.tour_image)} alt={order.tour_name} />
                  <span>{order.tour_name}</span>
                </div>
              </td>
              <td>
                <div>{order.user_name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>{order.user_email}</div>
              </td>
              <td>{order.quantity}</td>
              <td>{order.total_price.toLocaleString('ru-RU')} ₽</td>
              <td>{formatDate(order.created_at)}</td>
              <td>
                <StatusBadge status={order.status}>
                  {order.status === 'pending' ? 'Ожидает' :
                   order.status === 'confirmed' ? 'Подтвержден' :
                   order.status === 'cancelled' ? 'Отменен' : order.status}
                </StatusBadge>
              </td>
              <ActionCell>
                {order.status === 'pending' && (
                  <>
                    <Button
                      confirm
                      onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                    >
                      Подтвердить
                    </Button>
                    <Button
                      cancel
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                    >
                      Отменить
                    </Button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <Button
                    cancel
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  >
                    Отменить
                  </Button>
                )}
              </ActionCell>
            </tr>
          ))}
        </tbody>
      </OrdersTable>
    </Container>
  );
};

export default OrderManagement; 