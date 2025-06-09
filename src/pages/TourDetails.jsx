import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { addToCart } from '../store/slices/cartSlice';
import { getImageUrl } from '../config';
import api from '../api/axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const TourHeader = styled.div`
  position: relative;
  height: 500px;
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
  margin-bottom: 3rem;
  box-shadow: ${theme.shadows.large};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
`;

const TourTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  color: white;
  z-index: 1;

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

const TourContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TourInfo = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  padding: 2rem;
  box-shadow: ${theme.shadows.large};
`;

const InfoSection = styled.section`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  h2 {
    color: ${theme.colors.text};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${theme.colors.border};
  }

  p {
    color: ${theme.colors.textLight};
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.colors.text};
  font-weight: 500;

  svg {
    width: 20px;
    height: 20px;
    color: ${theme.colors.primary};
  }
`;

const BookingCard = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  padding: 2rem;
  box-shadow: ${theme.shadows.large};
  position: sticky;
  top: 2rem;
  height: fit-content;
`;

const PriceTag = styled.div`
  font-size: 2rem;
  color: ${theme.colors.primary};
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;

  span {
    font-size: 1rem;
    color: ${theme.colors.textLight};
    font-weight: 400;
  }
`;

const BookingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

  &:disabled {
    background: ${theme.colors.border};
    cursor: not-allowed;
  }
`;

const BookingButton = styled.button`
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

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  background: ${theme.colors.error}10;
  padding: 1rem;
  border-radius: ${theme.borderRadius.medium};
  text-align: center;
  margin-top: 1rem;
  border: 1px solid ${theme.colors.error}30;
`;

const GuideSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: ${theme.colors.secondary}20;
  border-radius: ${theme.borderRadius.medium};
  margin-top: 1.5rem;
`;

const GuideAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.circle};
  object-fit: cover;
  border: 3px solid ${theme.colors.primary};
`;

const GuideInfo = styled.div`
  h3 {
    color: ${theme.colors.text};
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  p {
    color: ${theme.colors.textLight};
    margin: 0;
    font-size: 0.9rem;

    &.position {
      color: ${theme.colors.primary};
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
  }
`;

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { items } = useSelector(state => state.cart);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await api.get(`/api/tours/${id}`);
        setTour(response.data);
      } catch (err) {
        console.error('Error fetching tour:', err);
        setError('Не удалось загрузить информацию о туре');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (tour?.available_slots || 10)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: tour.id,
      name: tour.name,
      price: tour.price,
      image: tour.image,
      quantity
    }));
    navigate('/cart');
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: theme.colors.textLight }}>
          Загрузка...
        </div>
      </Container>
    );
  }

  if (error || !tour) {
    return (
      <Container>
        <ErrorMessage>
          {error || 'Тур не найден'}
        </ErrorMessage>
      </Container>
    );
  }

  const formatDuration = (duration) => {
    if (!duration) return '';
    const days = parseInt(duration);
    if (days === 1) return '1 день';
    if (days >= 2 && days <= 4) return `${days} дня`;
    return `${days} дней`;
  };

  const formatGroupSize = (size) => {
    if (!size) return '';
    return `до ${size} человек`;
  };

  const isInCart = items.some(item => item.id === tour.id);

  return (
    <Container>
      <TourHeader>
        <img src={getImageUrl(tour.image)} alt={tour.name} />
        <TourTitle>
          <h1>{tour.name}</h1>
          <p>{tour.short_description}</p>
        </TourTitle>
      </TourHeader>

      <TourContent>
        <TourInfo>
          <InfoSection>
            <h2>Описание</h2>
            <p>{tour.description}</p>
          </InfoSection>

          <InfoSection>
            <h2>Особенности</h2>
            <FeatureList>
              <FeatureItem>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Продолжительность: {formatDuration(tour.duration)}
              </FeatureItem>
              <FeatureItem>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Локация: {tour.location}
              </FeatureItem>
              <FeatureItem>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Сложность: {
                  tour.difficulty === 'easy' ? 'Легкий' :
                  tour.difficulty === 'medium' ? 'Средний' : 'Сложный'
                }
              </FeatureItem>
              <FeatureItem>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Размер группы: {formatGroupSize(tour.total_slots)}
              </FeatureItem>
            </FeatureList>
          </InfoSection>

          {tour.guide && (
            <InfoSection>
              <h2>Ваш гид</h2>
              <GuideSection>
                <GuideAvatar 
                  src={getImageUrl(tour.guide.avatar)} 
                  alt={tour.guide.name}
                />
                <GuideInfo>
                  <h3>{tour.guide.name}</h3>
                  <p className="position">{tour.guide.position}</p>
                  <p>{tour.guide.description}</p>
                </GuideInfo>
              </GuideSection>
            </InfoSection>
          )}
        </TourInfo>

        <BookingCard>
          <PriceTag>
            {tour.price.toLocaleString('ru-RU')} ₽
            <span> за человека</span>
          </PriceTag>

          <BookingForm onSubmit={(e) => e.preventDefault()}>
            <FormGroup>
              <label>Количество человек</label>
              <Input
                type="number"
                min="1"
                max={tour.available_slots}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isInCart}
              />
            </FormGroup>

            <div style={{ color: theme.colors.textLight, fontSize: '0.9rem', textAlign: 'center' }}>
              {tour.available_slots > 0 ? (
                `Осталось ${tour.available_slots} мест`
              ) : (
                'Мест нет'
              )}
            </div>

            <BookingButton
              onClick={handleAddToCart}
              disabled={isInCart || tour.available_slots === 0}
            >
              {isInCart ? 'Тур уже в корзине' : 'Добавить в корзину'}
            </BookingButton>
          </BookingForm>
        </BookingCard>
      </TourContent>
    </Container>
  );
};

export default TourDetails; 