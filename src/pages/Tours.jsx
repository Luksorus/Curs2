import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { getImageUrl } from '../config';
import api from '../api/axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;

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

  p {
    color: ${theme.colors.textLight};
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const FiltersSection = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: ${theme.shadows.large};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: ${theme.colors.text};
    font-weight: 500;
  }
`;

const Select = styled.select`
  padding: 1rem;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  color: ${theme.colors.text};
  background: white;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
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

  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;

const ToursGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const TourCard = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
  box-shadow: ${theme.shadows.medium};
  transition: all ${theme.transitions.fast};
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.large};
  }
`;

const TourImage = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${theme.transitions.fast};
  }

  ${TourCard}:hover & img {
    transform: scale(1.1);
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
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }
`;

const TourBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: ${props => {
    switch (props.difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: white;
  border-radius: ${theme.borderRadius.small};
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1;
`;

const TourContent = styled.div`
  padding: 1.5rem;
`;

const TourTitle = styled.h3`
  color: ${theme.colors.text};
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
`;

const TourLocation = styled.p`
  color: ${theme.colors.primary};
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TourDescription = styled.p`
  color: ${theme.colors.textLight};
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TourFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${theme.colors.border};
`;

const TourPrice = styled.div`
  color: ${theme.colors.text};
  font-weight: 600;
  font-size: 1.25rem;

  span {
    color: ${theme.colors.textLight};
    font-size: 0.875rem;
    font-weight: 400;
  }
`;

const TourStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${theme.colors.textLight};
  font-size: 0.875rem;

  div {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${theme.colors.textLight};

  h3 {
    color: ${theme.colors.text};
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    margin-bottom: 2rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${theme.colors.textLight};
`;

const ErrorContainer = styled.div`
  color: ${theme.colors.error};
  text-align: center;
  padding: 2rem;
  background: ${theme.colors.error}10;
  border-radius: ${theme.borderRadius.medium};
`;

const Tours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    duration: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const fetchTours = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, value]) => value !== '')
      );
      const response = await api.get('/api/tours', { params: cleanFilters });
      setTours(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Не удалось загрузить список туров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    fetchTours(debouncedFilters);
  }, [debouncedFilters, fetchTours]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Легкий';
      case 'medium':
        return 'Средний';
      case 'hard':
        return 'Сложный';
      default:
        return 'Не указано';
    }
  };

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

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div>Загрузка...</div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Наши туры</h1>
        <p>
          Выберите свое идеальное приключение из нашей коллекции уникальных туров
        </p>
      </Header>

      <FiltersSection>
        <h2>Фильтры</h2>
        <FiltersGrid>
          <FilterGroup>
            <label>Локация</label>
            <Input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Введите локацию"
            />
          </FilterGroup>
          <FilterGroup>
            <label>Сложность</label>
            <Select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
            >
              <option value="">Все</option>
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </Select>
          </FilterGroup>
          <FilterGroup>
            <label>Минимальная цена</label>
            <Input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="От"
              min="0"
            />
          </FilterGroup>
          <FilterGroup>
            <label>Максимальная цена</label>
            <Input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="До"
              min="0"
            />
          </FilterGroup>
          <FilterGroup>
            <label>Длительность (дней)</label>
            <Input
              type="number"
              name="duration"
              value={filters.duration}
              onChange={handleFilterChange}
              placeholder="Количество дней"
              min="1"
            />
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      {tours.length > 0 ? (
        <ToursGrid>
          {tours.map(tour => (
            <TourCard key={tour.id} onClick={() => navigate(`/tours/${tour.id}`)}>
              <TourImage>
                <img src={getImageUrl(tour.image)} alt={tour.name} />
                <TourBadge difficulty={tour.difficulty}>
                  {getDifficultyText(tour.difficulty)}
                </TourBadge>
              </TourImage>
              <TourContent>
                <TourTitle>{tour.name}</TourTitle>
                <TourLocation>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {tour.location}
                </TourLocation>
                <TourDescription>
                  {tour.description}
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Продолжительность:</strong> {formatDuration(tour.duration)}
                  </div>
                  <div>
                    <strong>Размер группы:</strong> {formatGroupSize(tour.total_slots)}
                  </div>
                </TourDescription>
                <TourFooter>
                  <TourPrice>
                    {tour.price.toLocaleString('ru-RU')} ₽
                    <span> /чел.</span>
                  </TourPrice>
                  <TourStats>
                    <div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tour.duration}
                    </div>
                    <div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {tour.group_size}
                    </div>
                  </TourStats>
                </TourFooter>
              </TourContent>
            </TourCard>
          ))}
        </ToursGrid>
      ) : (
        <NoResults>
          <h3>Туры не найдены</h3>
          <p>
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
        </NoResults>
      )}
    </Container>
  );
};

export default Tours; 