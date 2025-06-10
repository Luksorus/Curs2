import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api/axios';
import { config } from '../config';
import { updateUser } from '../store/slices/authSlice';
import { getImageUrl } from '../config';
import GuideProfile from '../components/GuideProfile';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const ProfileSection = styled.section`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  background: ${theme.gradients.primary};
  padding: 3rem 2rem;
  color: white;
  text-align: center;
  position: relative;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const ProfileContent = styled.div`
  padding: 2rem;
`;

const Avatar = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: -75px auto 2rem;
  border-radius: ${theme.borderRadius.circle};
  border: 4px solid ${theme.colors.background};
  box-shadow: ${theme.shadows.medium};
  overflow: hidden;
  background: ${theme.colors.secondary};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover .overlay {
    opacity: 1;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${theme.transitions.fast};
  cursor: pointer;
  color: white;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: ${theme.colors.text};
    font-weight: 500;
  }
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.secondary ? 'transparent' : theme.gradients.primary};
  color: ${props => props.secondary ? theme.colors.primary : 'white'};
  border: ${props => props.secondary ? `2px solid ${theme.colors.primary}` : 'none'};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    background: ${props => props.secondary ? theme.colors.primary : theme.gradients.primary};
    color: white;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${theme.colors.textLight};
    border-color: ${theme.colors.textLight};
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  background: ${theme.colors.error}10;
  padding: 1rem;
  border-radius: ${theme.borderRadius.medium};
  text-align: center;
  margin-top: 1rem;
  border: 1px solid ${theme.colors.error}30;
`;

const SuccessMessage = styled.div`
  color: ${theme.colors.success};
  background: ${theme.colors.success}10;
  padding: 1rem;
  border-radius: ${theme.borderRadius.medium};
  text-align: center;
  margin-top: 1rem;
  border: 1px solid ${theme.colors.success}30;
`;

const OrdersSection = styled.section`
  margin-top: 3rem;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  overflow: hidden;

  h3 {
    background: ${theme.colors.secondary};
    color: ${theme.colors.text};
    padding: 1.5rem 2rem;
    margin: 0;
    font-size: 1.5rem;
  }
`;

const OrdersList = styled.div`
  padding: 2rem;
`;

const OrderCard = styled.div`
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.medium};
  }

  h4 {
    color: ${theme.colors.primary};
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
  }

  p {
    color: ${theme.colors.textLight};
    margin: 0.5rem 0;
  }

  .price {
    color: ${theme.colors.text};
    font-weight: 500;
    font-size: 1.1rem;
  }

  .date {
    color: ${theme.colors.textLight};
    font-size: 0.9rem;
  }
`;

const Profile = () => {
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    description: ''
  });
  const [originalData, setOriginalData] = useState(null);

  console.log('Profile render:', {
    auth,
    user,
    loading,
    error,
    orders,
    editMode
  });

  useEffect(() => {
    fetchOrders();
    
    if (user) {
      const initialData = {
        name: user.name || '',
        email: user.email || '',
        position: user.position || '',
        description: user.description || ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/my');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
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

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения';
      case 'confirmed':
        return 'Подтвержден';
      case 'cancelled':
        return 'Отменен';
      case 'completed':
        return 'Завершен';
      default:
        return 'Неизвестный статус';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'guide':
        return 'Гид';
      default:
        return 'Пользователь';
    }
  };

  if (!user) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (file) {
      await handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setError('');
      console.log('Starting avatar upload for file:', file.name);
      
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('FormData created:', {
        'Content-Type': file.type,
        size: file.size,
        name: file.name
      });

      const response = await api.post(
        '/api/users/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response.data);
      dispatch(updateUser({ ...user, avatar: response.data.avatar }));
    } catch (error) {
      console.error('Error uploading avatar:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Ошибка при загрузке фото: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.put('/api/users/profile', formData);
      dispatch(updateUser(response.data));
      setOriginalData(formData);
      setEditMode(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при обновлении профиля');
    }
  };

  const handleCancel = () => {
    if (JSON.stringify(formData) !== JSON.stringify(originalData)) {
      if (window.confirm('Вы уверены, что хотите отменить изменения? Все несохраненные данные будут потеряны.')) {
        setFormData(originalData);
        setEditMode(false);
      }
    } else {
      setEditMode(false);
    }
  };

  return (
    <Container>
      <ProfileSection>
        <ProfileHeader>
          <h2>Личный кабинет</h2>
        </ProfileHeader>

        <ProfileContent>
          <Avatar>
            {user.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.name} />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '3rem',
                color: theme.colors.textLight
              }}>
                {user.name ? user.name[0].toUpperCase() : '?'}
              </div>
            )}
            <AvatarOverlay className="overlay" onClick={triggerFileInput}>
              Изменить фото
            </AvatarOverlay>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Avatar>

          {editMode ? (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Имя</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Имя"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                />
              </FormGroup>

              {(user.role === 'guide' || user.role === 'admin') && (
                <>
                  <FormGroup>
                    <label>Должность</label>
                    <Input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Должность"
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>О себе</label>
                    <TextArea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Расскажите о себе"
                    />
                  </FormGroup>
                </>
              )}

              <ButtonGroup>
                <Button type="submit">
                  Сохранить
                </Button>
                <Button type="button" onClick={handleCancel} secondary>
                  Отмена
                </Button>
              </ButtonGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
            </Form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: theme.colors.text,
                marginBottom: '0.5rem',
                fontSize: '1.5rem'
              }}>
                {user.name}
              </h3>
              <p style={{ 
                color: theme.colors.textLight,
                marginBottom: '0.5rem'
              }}>
                {user.email}
              </p>
              <p style={{ 
                color: theme.colors.primary,
                marginBottom: '1.5rem',
                fontWeight: '500'
              }}>
                {getRoleText(user.role)}
              </p>
              {(user.role === 'guide' || user.role === 'admin') && user.position && (
                    <p style={{ 
                      color: theme.colors.text,
                      marginBottom: '0.5rem'
                    }}>
                  {user.position}
                    </p>
                  )}
              {(user.role === 'guide' || user.role === 'admin') && user.description && (
                    <p style={{ 
                      color: theme.colors.textLight,
                  marginBottom: '1.5rem'
                    }}>
                      {user.description}
                    </p>
                  )}
              <Button onClick={() => setEditMode(true)}>
                Редактировать профиль
              </Button>
            </div>
          )}
        </ProfileContent>
      </ProfileSection>

      {}
      {user.role === 'guide' && (
        <GuideProfile />
      )}

      {}
      {user.role === 'user' && (
      <OrdersSection>
        <h3>Мои заказы</h3>
        <OrdersList>
          {loading ? (
            <p style={{ textAlign: 'center', color: theme.colors.textLight }}>
              Загрузка...
            </p>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <OrderCard key={order.id}>
                <h4>{order.tour_name}</h4>
                <p className="date">
                  Дата заказа: {formatDate(order.created_at)}
                </p>
                <p className="price">
                  Стоимость: {order.total_price} ₽
                </p>
                  <p>Статус: {getStatusText(order.status)}</p>
              </OrderCard>
            ))
          ) : (
            <p style={{ 
              textAlign: 'center', 
              color: theme.colors.textLight,
              padding: '2rem'
            }}>
              У вас пока нет заказов
            </p>
          )}
        </OrdersList>
      </OrdersSection>
      )}
    </Container>
  );
};

export default Profile; 