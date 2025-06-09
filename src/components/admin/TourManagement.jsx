import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { getImageUrl, config } from '../../config';
import { theme } from '../../styles/theme';
import api from '../../api/axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;

  h2 {
    color: ${theme.colors.text};
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.variant === 'danger' 
    ? theme.colors.error 
    : props.variant === 'secondary'
    ? 'transparent'
    : theme.gradients.primary};
  color: ${props => props.variant === 'secondary' ? theme.colors.text : 'white'};
  border: ${props => props.variant === 'secondary' ? `2px solid ${theme.colors.border}` : 'none'};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    background: ${props => props.variant === 'danger' 
      ? theme.colors.errorDark 
      : props.variant === 'secondary'
      ? theme.colors.primary + '20'
      : theme.gradients.primaryDark};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    justify-content: center;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${theme.colors.background};
  padding: 2rem;
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;

  h2 {
    color: ${theme.colors.text};
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const Form = styled.form`
  display: grid;
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

  input, select, textarea {
    padding: 0.75rem;
    border: 2px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 1rem;
    transition: all ${theme.transitions.fast};

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 2px ${theme.colors.primary}20;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;

  @media (max-width: 1024px) {
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const TourCard = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${theme.shadows.medium};
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.large};
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TourGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
`;

const TourImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.medium};

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
`;

const TourInfo = styled.div`
  h3 {
    color: ${theme.colors.text};
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${theme.colors.textLight};
    margin: 0;
  }

  @media (max-width: 768px) {
    margin: 1rem 0;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  padding: 1rem;
  background: #d4edda;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const TourManagement = () => {
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingPreviewUrl, setEditingPreviewUrl] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTour, setNewTour] = useState({
    name: '',
    description: '',
    difficulty: 'easy',
    duration: '',
    distance: '',
    price: '',
    location: '',
    guide_id: '',
    total_slots: 10,
    available_slots: 10
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'easy',
    duration: '',
    distance: '',
    price: '',
    location: '',
    total_slots: 10,
    available_slots: 10,
    image: null
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchGuides = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${config.apiUrl}/api/tours/guides`, getAuthHeader());
      if (response.data.length === 0) {
        setError('Нет доступных гидов. Пожалуйста, убедитесь, что у вас есть пользователи с ролью "Руководитель туров"');
        return;
      }
      setGuides(response.data);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setError('Ошибка при получении списка гидов: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
      setGuides([]);
    }
  }, []);

  const fetchTours = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/tours`, getAuthHeader());
      console.log('Fetched tours:', response.data);
      setTours(response.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setError('Ошибка при загрузке туров: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
    fetchTours();
  }, [fetchGuides, fetchTours]);

  useEffect(() => {
    // Очищаем URL объекта при размонтировании компонента
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (editingPreviewUrl) URL.revokeObjectURL(editingPreviewUrl);
    };
  }, [previewUrl, editingPreviewUrl]);

  const handleFileChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isEditing) {
        setEditingFile(file);
        setEditingPreviewUrl(previewUrl);
      } else {
        setSelectedFile(file);
        setPreviewUrl(previewUrl);
      }
    }
  };

  const handleEditTour = (tour) => {
    setEditingTour({ ...tour });
    setEditingPreviewUrl(tour.image ? getImageUrl(tour.image) : null);
  };

  const handleUpdateTour = async () => {
    try {
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('name', editingTour.name);
      formData.append('description', editingTour.description);
      formData.append('difficulty', editingTour.difficulty);
      formData.append('duration', editingTour.duration);
      formData.append('distance', editingTour.distance);
      formData.append('price', editingTour.price);
      formData.append('location', editingTour.location);
      formData.append('guide_id', editingTour.guide_id);
      formData.append('total_slots', editingTour.total_slots);
      formData.append('available_slots', editingTour.available_slots);
      
      if (editingFile) {
        formData.append('image', editingFile);
      }

      const config = {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.put(`${config.apiUrl}/api/tours/${editingTour.id}`, formData, config);
      setSuccess('Тур успешно обновлен');
      setEditingTour(null);
      setEditingFile(null);
      setEditingPreviewUrl(null);
      fetchTours();
    } catch (error) {
      console.error('Error updating tour:', error);
      setError('Ошибка при обновлении тура: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
    }
  };

  const handleDeleteTour = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тур?')) {
      try {
        setError('');
        await axios.delete(`${config.apiUrl}/api/tours/${id}`, getAuthHeader());
        setSuccess('Тур успешно удален');
        fetchTours();
      } catch (error) {
        console.error('Error deleting tour:', error);
        setError('Ошибка при удалении тура: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingTour) {
        await axios.put(`${config.apiUrl}/api/tours/${editingTour.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Тур успешно обновлен');
      } else {
        await axios.post(`${config.apiUrl}/api/tours`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Тур успешно создан');
      }

      handleCloseModal();
      fetchTours();
    } catch (error) {
      console.error('Error saving tour:', error);
      setError('Ошибка при сохранении тура: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
    }
  };

  const handleOpenModal = (tour = null) => {
    if (tour) {
      setFormData({
        ...tour,
        image: null // Сбрасываем файл изображения
      });
      setEditingTour(tour);
    } else {
      setFormData({
        name: '',
        description: '',
        difficulty: 'easy',
        duration: '',
        distance: '',
        price: '',
        location: '',
        total_slots: 10,
        available_slots: 10,
        image: null
      });
      setEditingTour(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTour(null);
    setFormData({
      name: '',
      description: '',
      difficulty: 'easy',
      duration: '',
      distance: '',
      price: '',
      location: '',
      total_slots: 10,
      available_slots: 10,
      image: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Container>
      <Header>
        <h2>Управление турами</h2>
        <Button onClick={() => handleOpenModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Создать тур
        </Button>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {tours.map((tour) => (
        <TourCard key={tour.id}>
          <TourGrid>
            <TourImage
              src={getImageUrl(tour.image)}
              alt={tour.name}
            />
            <TourInfo>
              <h3>{tour.name}</h3>
              <p>{tour.description}</p>
              <p>Локация: {tour.location}</p>
              <p>Цена: {tour.price} ₽</p>
            </TourInfo>
            <ButtonGroup>
              <Button variant="secondary" onClick={() => handleOpenModal(tour)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Редактировать
              </Button>
              <Button variant="danger" onClick={() => handleDeleteTour(tour.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Удалить
              </Button>
            </ButtonGroup>
          </TourGrid>
        </TourCard>
      ))}

      {isModalOpen && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>{editingTour ? 'Редактировать тур' : 'Создать новый тур'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Название тура</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Описание</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Сложность</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Продолжительность (дней)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </FormGroup>
              <FormGroup>
                <label>Расстояние (км)</label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <label>Цена (₽)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <label>Локация</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Размер группы</label>
                <input
                  type="number"
                  name="total_slots"
                  value={formData.total_slots}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </FormGroup>
              <FormGroup>
                <label>Изображение</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  {...(!editingTour && { required: true })}
                />
              </FormGroup>
              <ButtonGroup>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>
                  Отмена
                </Button>
                <Button type="submit">
                  {editingTour ? 'Сохранить изменения' : 'Создать тур'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default TourManagement; 