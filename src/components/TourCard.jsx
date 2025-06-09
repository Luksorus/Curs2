import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getImageUrl, config } from '../config';

const TourCard = ({ tour, onOrderSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOrder = async () => {
    if (!user) {
      setError('Пожалуйста, войдите в систему для заказа тура');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${config.apiUrl}/api/tours/order`, 
        { tourId: tour.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Тур успешно добавлен в корзину');
      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при заказе тура');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tour-card">
      <img src={getImageUrl(tour.image)} alt={tour.name} className="tour-image" />
      <div className="tour-info">
        <h3>{tour.name}</h3>
        <p>{tour.description}</p>
        
        <div className="tour-details">
          <div className="detail-row">
            <span className="detail-label">Сложность:</span>
            <span className="detail-value">{
              tour.difficulty === 'easy' ? 'Легкая' :
              tour.difficulty === 'medium' ? 'Средняя' : 'Сложная'
            }</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Длительность:</span>
            <span className="detail-value">{tour.duration} дней</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Расстояние:</span>
            <span className="detail-value">{tour.distance} км</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Локация:</span>
            <span className="detail-value">{tour.location}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Стоимость:</span>
            <span className="detail-value">{tour.price} ₽</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Свободные места:</span>
            <span className="detail-value slots-info">
              {tour.available_slots} из {tour.total_slots}
              {tour.available_slots === 0 && (
                <span className="no-slots-warning">Мест нет</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="guide-info">
          <h4>Руководитель тура:</h4>
          {tour.guide_name ? (
            <>
              <p className="guide-name">{tour.guide_name}</p>
              {tour.guide_position && (
                <p className="guide-position">{tour.guide_position}</p>
              )}
            </>
          ) : (
            <p>Гид не назначен</p>
          )}
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <button 
          onClick={handleOrder} 
          disabled={loading || tour.available_slots === 0 || !tour.guide_name}
          className={`order-button ${
            tour.available_slots === 0 ? 'disabled' :
            !tour.guide_name ? 'disabled' : ''
          }`}
        >
          {loading ? 'Загрузка...' : 
           tour.available_slots === 0 ? 'Нет мест' :
           !tour.guide_name ? 'Гид не назначен' : 'Забронировать'}
        </button>
      </div>

      <style jsx>{`
        .tour-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tour-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .tour-info {
          padding: 20px;
        }

        .tour-details {
          margin: 15px 0;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }

        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .detail-label {
          color: #666;
          font-weight: 500;
        }

        .slots-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .no-slots-warning {
          color: #dc3545;
          font-size: 14px;
          padding: 2px 6px;
          background: #f8d7da;
          border-radius: 4px;
        }

        .guide-info {
          margin: 15px 0;
          padding: 15px;
          background: #e9ecef;
          border-radius: 4px;
        }

        .guide-name {
          font-weight: 500;
          margin: 5px 0;
        }

        .guide-position {
          color: #666;
          font-size: 14px;
        }

        .error {
          color: #dc3545;
          background: #f8d7da;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .success {
          color: #28a745;
          background: #d4edda;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .order-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
          font-size: 16px;
          transition: background-color 0.2s;
        }

        .order-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .order-button.disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default TourCard; 