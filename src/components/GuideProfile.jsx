import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import { config, getImageUrl } from '../config';
import styled from 'styled-components';
import { updateUser } from '../store/slices/authSlice';
import axios from 'axios';
import { theme } from '../styles/theme';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const GuideInfo = styled(motion.div)`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${theme.shadows.large};
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.xlarge};
  }

  .guide-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .guide-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid ${theme.colors.primary}20;
    transition: all ${theme.transitions.fast};

    &:hover {
      border-color: ${theme.colors.primary};
      transform: scale(1.05);
    }
  }

  .guide-details {
    h2 {
      margin: 0 0 0.5rem 0;
      color: ${theme.colors.text};
      font-size: 1.8rem;
    }

    .guide-email {
      color: ${theme.colors.textLight};
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .guide-position {
      color: ${theme.colors.primary};
      font-weight: 600;
      margin: 0;
      font-size: 1.1rem;
    }
  }

  .guide-description {
    color: ${theme.colors.text};
    line-height: 1.8;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid ${theme.colors.border};
    font-size: 1.1rem;
  }
`;

const TourCard = styled(motion.div)`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: ${theme.shadows.medium};
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.large};
  }

  .tour-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 2rem;
  }

  .tour-image {
    width: 250px;
    height: 180px;
    object-fit: cover;
    border-radius: ${theme.borderRadius.medium};
    transition: all ${theme.transitions.fast};

    &:hover {
      transform: scale(1.05);
    }
  }

  .tour-main-info {
    flex: 1;

    h3 {
      margin: 0 0 1rem 0;
      color: ${theme.colors.text};
      font-size: 1.5rem;
    }
  }

  .tour-stats {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;

    .stat {
      background: ${theme.colors.primary}10;
      color: ${theme.colors.primary};
      padding: 0.5rem 1rem;
      border-radius: ${theme.borderRadius.small};
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  .tour-details {
    margin-bottom: 2rem;

    p {
      color: ${theme.colors.textLight};
      line-height: 1.8;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
    }
  }

  .tour-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    background: ${theme.colors.background}80;
    padding: 1.5rem;
    border-radius: ${theme.borderRadius.medium};
    margin-bottom: 2rem;
    border: 1px solid ${theme.colors.border};

    div {
      strong {
        color: ${theme.colors.text};
        display: block;
        margin-bottom: 0.5rem;
        font-size: 1rem;
      }

      span {
        color: ${theme.colors.textLight};
        font-size: 1.1rem;
      }
    }
  }
`;

const ParticipantsSection = styled.div`
  margin-top: 2rem;
  
  h4 {
    margin: 0 0 1.5rem 0;
    color: ${theme.colors.text};
    font-size: 1.3rem;
  }

  .participants-table {
    overflow-x: auto;
    background: ${theme.colors.background};
    border-radius: ${theme.borderRadius.medium};
    box-shadow: ${theme.shadows.medium};

    table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid ${theme.colors.border};
      }

      th {
        background: ${theme.colors.background}80;
        font-weight: 600;
        color: ${theme.colors.text};
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        color: ${theme.colors.textLight};
        font-size: 1rem;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: ${theme.borderRadius.small};
        font-size: 0.9rem;
        font-weight: 500;

        &.status-pending {
          background: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
        }

        &.status-confirmed {
          background: ${theme.colors.success}20;
          color: ${theme.colors.success};
        }

        &.status-completed {
          background: ${theme.colors.primary}20;
          color: ${theme.colors.primary};
        }

        &.status-cancelled {
          background: ${theme.colors.error}20;
          color: ${theme.colors.error};
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      tr {
        transition: all ${theme.transitions.fast};

        &:hover {
          background: ${theme.colors.background}40;
        }
      }
    }
  }

  .no-participants {
    padding: 2rem;
    background: ${theme.colors.background}40;
    border-radius: ${theme.borderRadius.medium};
    text-align: center;
    color: ${theme.colors.textLight};
    border: 2px dashed ${theme.colors.border};

    p {
      margin: 0;
      font-size: 1.1rem;
    }
  }
`;

const EditButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 0.5rem;
  font-size: 0.875rem;
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
  transition: opacity 0.2s;
  cursor: pointer;
  color: white;
  border-radius: 50%;

  &:hover {
    opacity: 1;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
`;

const GuideProfile = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGuideTours = async () => {
    try {
      const response = await api.get(config.endpoints.tours.guideTours);
      
      
      const toursWithStats = response.data.map(tour => {
        
        const activeParticipants = tour.participants.filter(p => p.order_status !== 'cancelled');
        const cancelledParticipants = tour.participants.filter(p => p.order_status === 'cancelled');
        
        
        const totalOrderedSlots = activeParticipants.reduce((sum, p) => sum + parseInt(p.order_count || 0), 0);
        
        return {
          ...tour,
          total_ordered_slots: totalOrderedSlots,
          is_full: totalOrderedSlots >= tour.total_slots,
          participants: [
            ...activeParticipants.sort((a, b) => new Date(b.order_created) - new Date(a.order_created)),
            ...cancelledParticipants.sort((a, b) => new Date(b.order_created) - new Date(a.order_created))
          ]
        };
      });

      setTours(toursWithStats);
      setError('');
    } catch (error) {
      console.error('Ошибка при загрузке туров гида:', error);
      setError('Ошибка при загрузке информации о турах');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchGuideTours();
  }, []);

  if (loading) {
    return <div className="loading">Загрузка туров...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>Мои туры</h2>
      {tours.length === 0 ? (
        <p className="no-tours">У вас пока нет назначенных туров</p>
      ) : (
        tours.map(tour => (
          <TourCard key={tour.id}>
            <div className="tour-header">
              <div className="tour-main-info">
                <h3>{tour.name}</h3>
                <div className="tour-stats">
                  <span className="stat">
                    Места: {tour.total_slots - tour.total_ordered_slots} из {tour.total_slots}
                  </span>
                  <span className="stat">
                    Заказов: {tour.total_ordered_slots}
                  </span>
                  {tour.is_full && (
                    <span className="stat status-full">
                      Мест нет
                    </span>
                  )}
                </div>
              </div>
              {tour.image && (
                <img 
                  src={getImageUrl(tour.image)} 
                  alt={tour.name} 
                  className="tour-image"
                />
              )}
            </div>

            <div className="tour-details">
              <p>{tour.description}</p>
              <div className="tour-info-grid">
                <div>
                  <strong>Локация:</strong>
                  {tour.location}
                </div>
                <div>
                  <strong>Сложность:</strong>
                  {tour.difficulty === 'easy' ? 'Легкая' :
                   tour.difficulty === 'medium' ? 'Средняя' : 'Сложная'}
                </div>
                <div>
                  <strong>Длительность:</strong>
                  {tour.duration} дней
                </div>
                <div>
                  <strong>Стоимость:</strong>
                  {tour.price} ₽
                </div>
              </div>
            </div>

            <ParticipantsSection>
              <h4>Участники тура:</h4>
              {tour.participants && tour.participants.length > 0 ? (
                <div className="participants-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Статус</th>
                        <th>Количество</th>
                        <th>Дата заказа</th>
                        <th>Стоимость</th>
                        <th>Примечания</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tour.participants.map(participant => (
                        <tr key={`${participant.user_id}-${participant.order_id}-${participant.order_status}`}
                            style={{ opacity: participant.order_status === 'cancelled' ? 0.6 : 1 }}>
                          <td>{participant.user_name}</td>
                          <td>{participant.user_email}</td>
                          <td>
                            <span className={`status status-${participant.order_status}`}>
                              {participant.order_status === 'pending' ? 'Ожидает подтверждения' :
                               participant.order_status === 'confirmed' ? 'Подтвержден' :
                               participant.order_status === 'completed' ? 'Завершен' : 'Отменен'}
                            </span>
                          </td>
                          <td>{participant.order_count}</td>
                          <td>{new Date(participant.order_created).toLocaleDateString()}</td>
                          <td>{participant.tour_price * participant.order_count} ₽</td>
                          <td>{participant.order_notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-participants">
                  <p>Пока нет участников в этом туре</p>
                </div>
              )}
            </ParticipantsSection>
          </TourCard>
        ))
      )}
    </div>
  );
};

export default GuideProfile;