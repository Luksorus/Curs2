import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchTours } from '../store/slices/toursSlice';
import { config, getImageUrl } from '../config';
import axios from 'axios';
import { theme } from '../styles/theme';
import { useNavigate } from 'react-router-dom';

const Hero = styled.section`
  text-align: center;
  padding: 6rem 2rem;
  background: ${theme.gradients.primary};
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(255, 153, 102, 0.3), rgba(255, 87, 34, 0.4));
    z-index: 1;
  }

  h1 {
    position: relative;
    z-index: 2;
    font-size: 3rem;
    margin-bottom: 1.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    position: relative;
    z-index: 2;
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const HeroButton = styled.button`
  position: relative;
  z-index: 2;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${theme.colors.primary};
  background: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const AboutSection = styled.section`
  padding: 6rem 2rem;
  background: ${theme.colors.backgroundAlt};
  
  .content {
    max-width: 1200px;
    margin: 0 auto;
  }

  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: ${theme.colors.text};
    font-size: 2.5rem;
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

  .features {
    display: grid;
    gap: 2rem;
    margin-top: 3rem;
    justify-content: center;

    @media (min-width: 1200px) {
      grid-template-columns: repeat(2, minmax(280px, 1fr));
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (min-width: 768px) and (max-width: 1199px) {
      grid-template-columns: repeat(2, minmax(250px, 1fr));
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 767px) {
      grid-template-columns: minmax(280px, 1fr);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .feature {
    text-align: center;
    padding: 2rem;
    background: ${theme.colors.background};
    border-radius: ${theme.borderRadius.medium};
    box-shadow: ${theme.shadows.medium};
    transition: transform ${theme.transitions.medium};
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &:hover {
      transform: translateY(-5px);
      box-shadow: ${theme.shadows.large};
    }

    h3 {
      color: ${theme.colors.primary};
      margin: 1rem 0;
      font-size: 1.5rem;
    }

    p {
      color: ${theme.colors.textLight};
      line-height: 1.6;
      margin: 0;
    }
  }
`;

const ToursSection = styled.section`
  position: relative;
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;

  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }
`;

const ToursScroll = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 2rem;
  padding: 1rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: ${theme.colors.primary};
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 2;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }

  &.prev {
    left: 0;
  }

  &.next {
    right: 0;
  }
`;

const TourCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  min-width: 300px;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.large};
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  h3 {
    padding: 1rem;
    margin: 0;
    font-size: 1.2rem;
  }

  p {
    padding: 0 1rem 1rem;
    margin: 0;
    color: ${theme.colors.textLight};

    &.price {
      font-weight: bold;
      color: ${theme.colors.primary};
    }
  }
`;

const TeamSection = styled.section`
  padding: 6rem 2rem;
  background: ${theme.colors.background};
  
  h2 {
    text-align: center;
    color: ${theme.colors.text};
    font-size: 2.5rem;
    margin-bottom: 3rem;
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
  
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const TeamMember = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${theme.colors.backgroundAlt};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
  transition: all ${theme.transitions.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.large};
  }
  
  img {
    width: 200px;
    height: 200px;
    border-radius: ${theme.borderRadius.circle};
    object-fit: cover;
    margin-bottom: 1.5rem;
    border: 3px solid ${theme.colors.primary};
  }

  .avatar-placeholder {
    width: 200px;
    height: 200px;
    border-radius: ${theme.borderRadius.circle};
    background: ${theme.colors.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: ${theme.colors.primary};
    margin: 0 auto 1.5rem;
    border: 3px solid ${theme.colors.primary};
  }

  h3 {
    color: ${theme.colors.text};
    margin: 0.5rem 0;
    font-size: 1.5rem;
  }

  p {
    color: ${theme.colors.textLight};
    margin: 0.25rem 0;
  }

  .guide-description {
    font-size: 0.9rem;
    margin-top: 1rem;
    color: ${theme.colors.textLight};
    white-space: normal;
    line-height: 1.6;
  }

  .position {
    color: ${theme.colors.primary};
    font-weight: 500;
    margin: 0.5rem 0;
  }
`;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tours, loading } = useSelector(state => state.tours);
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const toursScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  useEffect(() => {
    dispatch(fetchTours());
  }, [dispatch]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setGuidesLoading(true);
        const response = await axios.get(`${config.apiUrl}/api/tours/guides`);
        setGuides(response.data);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setGuidesLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const checkScrollButtons = useCallback(() => {
    if (toursScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = toursScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    const scrollContainer = toursScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [checkScrollButtons]);

  useEffect(() => {
    if (!loading) {
      checkScrollButtons();
    }
  }, [loading, checkScrollButtons]);

  const scroll = (direction) => {
    if (toursScrollRef.current) {
      const scrollAmount = 300;
      const scrollLeft = toursScrollRef.current.scrollLeft;
      toursScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      <Hero>
        <h1>Откройте мир вместе с нами</h1>
        <p>Организуем незабываемые туры по самым красивым местам</p>
        <HeroButton onClick={() => navigate('/tours')}>
          Найти тур
        </HeroButton>
      </Hero>

      <ToursSection>
        <h2>Ближайшие туры</h2>
        <ScrollButton 
          className="prev" 
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Предыдущие туры"
        >
          ←
        </ScrollButton>
        <ToursScroll ref={toursScrollRef}>
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            tours.slice(0, 5).map(tour => (
              <TourCard 
                key={tour.id}
                onClick={() => navigate(`/tours/${tour.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={getImageUrl(tour.image)} alt={tour.name} />
                <h3>{tour.name}</h3>
                <p>{tour.shortDescription}</p>
                <div style={{ padding: '0 1rem' }}>
                  <p><strong>Продолжительность:</strong> {formatDuration(tour.duration)}</p>
                  <p><strong>Размер группы:</strong> {formatGroupSize(tour.total_slots)}</p>
                </div>
                <p className="price">от {tour.price} ₽</p>
              </TourCard>
            ))
          )}
        </ToursScroll>
        <ScrollButton 
          className="next" 
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Следующие туры"
        >
          →
        </ScrollButton>
      </ToursSection>

      <TeamSection>
        <h2>Наша команда</h2>
        <div className="team-grid">
          {guidesLoading ? (
            <p>Загрузка...</p>
          ) : guides.length > 0 ? (
            guides.map(guide => (
              <TeamMember key={guide.id}>
                {guide.avatar ? (
                  <img src={getImageUrl(guide.avatar)} alt={`Гид ${guide.name}`} />
                ) : (
                  <div className="avatar-placeholder">
                    {guide.name.charAt(0)}
                  </div>
                )}
                <h3>{guide.name}</h3>
                <p className="position">{guide.position || 'Гид'}</p>
                {guide.description && (
                  <p className="guide-description">{guide.description}</p>
                )}
              </TeamMember>
            ))
          ) : (
            <p style={{ 
              textAlign: 'center', 
              gridColumn: '1 / -1',
              color: theme.colors.textLight,
              fontSize: '1.1rem'
            }}>
              В данный момент нет доступных гидов
            </p>
          )}
        </div>
      </TeamSection>

      <AboutSection>
        <div className="content">
          <h2>О нас</h2>
          <p style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            color: theme.colors.textLight,
            lineHeight: '1.8',
            fontSize: '1.1rem'
          }}>
            Мы - команда профессионалов, объединенных страстью к путешествиям и исследованию новых мест. 
            Наша миссия - делать путешествия доступными, безопасными и незабываемыми для каждого.
          </p>
          <div className="features">
            <div className="feature">
              <h3>Профессиональные гиды</h3>
              <p>Наши гиды - опытные профессионалы с глубокими знаниями местности и истории каждого маршрута</p>
            </div>
            <div className="feature">
              <h3>Уникальные маршруты</h3>
              <p>Мы разрабатываем эксклюзивные маршруты, которые позволят вам увидеть самые красивые и интересные места</p>
            </div>
            <div className="feature">
              <h3>Безопасность</h3>
              <p>Безопасность наших туристов - наш главный приоритет. Все маршруты тщательно проработаны и проверены</p>
            </div>
            <div className="feature">
              <h3>Комфорт</h3>
              <p>Мы заботимся о вашем комфорте на протяжении всего путешествия, предоставляя качественный сервис</p>
            </div>
          </div>
        </div>
      </AboutSection>
    </div>
  );
};

export default Home; 