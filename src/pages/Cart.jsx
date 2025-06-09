import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { getImageUrl } from '../config';
import api from '../api/axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const CartHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: ${theme.colors.text};
    margin-bottom: 1rem;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: ${theme.colors.primary};
      border-radius: ${theme.borderRadius.small};
    }
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};

  h2 {
    color: ${theme.colors.text};
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  p {
    color: ${theme.colors.textLight};
    margin-bottom: 2rem;
    }
`;

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  overflow: hidden;
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 2rem;
  padding: 2rem;
  border-bottom: 2px solid ${theme.colors.border};
  transition: all ${theme.transitions.fast};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${theme.colors.secondary}20;
  }

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
  }
`;

const ItemImage = styled.img`
      width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.medium};
`;

const ItemInfo = styled.div`
  h3 {
    color: ${theme.colors.text};
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  p {
    color: ${theme.colors.textLight};
    margin: 0.25rem 0;
  }

  .price {
    color: ${theme.colors.primary};
    font-weight: 500;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    grid-column: 1 / -1;
  }
`;

const QuantityControl = styled.div`
  display: flex;
    align-items: center;
  gap: 0.5rem;
  background: ${theme.colors.background};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: 0.25rem;
`;

const QuantityButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primaryDark};
    }

  &:disabled {
    color: ${theme.colors.textLight};
    cursor: not-allowed;
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  text-align: center;
  border: none;
  font-size: 1rem;
  color: ${theme.colors.text};
  background: transparent;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.error};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.errorDark};
    text-decoration: underline;
  }
`;

const CartSummary = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;

  h2 {
    color: ${theme.colors.text};
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid ${theme.colors.border};
  }
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
      margin-bottom: 1rem;
  color: ${theme.colors.text};
  font-size: ${props => props.total ? '1.2rem' : '1rem'};
  font-weight: ${props => props.total ? '600' : '400'};

  span:last-child {
    color: ${props => props.total ? theme.colors.primary : theme.colors.text};
  }
`;

const CheckoutButton = styled.button`
    width: 100%;
    padding: 1rem;
  background: ${theme.gradients.primary};
    color: white;
    border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: 1.1rem;
  font-weight: 500;
    cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2rem;

    &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
    background: ${theme.colors.textLight};
      cursor: not-allowed;
      transform: none;
    }
`;

const BackButton = styled.button`
  background: none;
  border: 2px solid ${theme.colors.primary};
  color: ${theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: ${theme.borderRadius.medium};
      font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  margin-top: 2rem;

  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }
`;

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      await api.post('/api/orders', orderData);
      dispatch(clearCart());
      navigate('/profile');
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      setError(err.response?.data?.message || 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container>
        <CartHeader>
          <h1>Корзина</h1>
        </CartHeader>
        <EmptyCart>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте туры, которые хотите забронировать</p>
          <BackButton onClick={() => navigate('/tours')}>
            Перейти к турам
          </BackButton>
        </EmptyCart>
      </Container>
    );
  }

  return (
    <Container>
      <CartHeader>
      <h1>Корзина</h1>
      </CartHeader>

      <CartGrid>
        <CartItems>
          {items.map(item => (
        <CartItem key={item.id}>
              <ItemImage src={getImageUrl(item.image)} alt={item.name} />
          <ItemInfo>
            <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="price">{item.price.toLocaleString('ru-RU')} ₽ за человека</p>
          </ItemInfo>
          <ItemActions>
                <QuantityControl>
                  <QuantityButton
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </QuantityButton>
                  <QuantityInput
                    type="number"
                    min="1"
                    max="10"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  />
                  <QuantityButton
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                  >
                    +
                  </QuantityButton>
                </QuantityControl>
                <RemoveButton onClick={() => handleRemove(item.id)}>
              Удалить
                </RemoveButton>
          </ItemActions>
        </CartItem>
      ))}
        </CartItems>

        <CartSummary>
          <h2>Итого</h2>
          <SummaryItem>
            <span>Количество туров:</span>
            <span>{totalItems}</span>
          </SummaryItem>
          <SummaryItem>
            <span>Итого к оплате:</span>
            <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
          </SummaryItem>
          <CheckoutButton
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </CheckoutButton>
          {error && (
            <p style={{ 
              color: theme.colors.error,
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              {error}
            </p>
          )}
        </CartSummary>
      </CartGrid>
    </Container>
  );
};

export default Cart; 