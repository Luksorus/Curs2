import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const OrdersContainer = styled.div`
  margin-top: 2rem;
`;

const OrderCard = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: ${theme.shadows.small};
  transition: all ${theme.transitions.fast};

  &:hover {
    box-shadow: ${theme.shadows.medium};
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const OrderNumber = styled.h3`
  margin: 0;
  color: ${theme.colors.text};
  font-size: 1.1rem;
`;

const OrderDate = styled.span`
  color: ${theme.colors.textLight};
  font-size: 0.9rem;
`;

const OrderDetails = styled.div`
  display: grid;
  gap: 1rem;
`;

const TourInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: ${theme.borderRadius.small};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    img {
      width: 100%;
      height: 150px;
    }
  }
`;

const TourDetails = styled.div`
  flex: 1;
`;

const TourName = styled.h4`
  margin: 0 0 0.5rem 0;
  color: ${theme.colors.text};
`;

const TourMeta = styled.div`
  display: flex;
  gap: 2rem;
  color: ${theme.colors.textLight};
  font-size: 0.9rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: ${theme.borderRadius.small};
  font-size: 0.9rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending':
        return theme.colors.warning + '20';
      case 'confirmed':
        return theme.colors.success + '20';
      case 'cancelled':
        return theme.colors.error + '20';
      default:
        return theme.colors.disabled + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending':
        return theme.colors.warning;
      case 'confirmed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const Price = styled.div`
  font-weight: 500;
  color: ${theme.colors.text};
  font-size: 1.1rem;
`;

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Ожидает подтверждения';
    case 'confirmed':
      return 'Подтвержден';
    case 'cancelled':
      return 'Отменен';
    default:
      return 'Неизвестный статус';
  }
};

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

const OrderHistory = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <OrdersContainer>
        <p>У вас пока нет заказов</p>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      {orders.map((order) => (
        <OrderCard key={order.id}>
          <OrderHeader>
            <OrderNumber>Заказ #{order.id}</OrderNumber>
            <OrderDate>{formatDate(order.created_at)}</OrderDate>
          </OrderHeader>
          <OrderDetails>
            <TourInfo>
              <img src={order.tour.image} alt={order.tour.name} />
              <TourDetails>
                <TourName>{order.tour.name}</TourName>
                <TourMeta>
                  <span>Локация: {order.tour.location}</span>
                  <span>Количество человек: {order.number_of_people}</span>
                  <StatusBadge status={order.status}>
                    {getStatusText(order.status)}
                  </StatusBadge>
                </TourMeta>
              </TourDetails>
            </TourInfo>
            <Price>Стоимость: {order.total_price} ₽</Price>
          </OrderDetails>
        </OrderCard>
      ))}
    </OrdersContainer>
  );
};

export default OrderHistory; 