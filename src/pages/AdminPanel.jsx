import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api/axios';
import { theme } from '../styles/theme';
import UserManagement from '../components/admin/UserManagement';
import TourManagement from '../components/admin/TourManagement';
import OrderManagement from '../components/admin/OrderManagement';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
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

  p {
    color: ${theme.colors.textLight};
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? theme.gradients.primary : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.text};
  border: 2px solid ${props => props.active ? 'transparent' : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    background: ${props => props.active ? theme.gradients.primary : theme.colors.primary}20;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentContainer = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  padding: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #adb5bd;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: white;
  background: ${props => {
    switch (props.role) {
      case 'admin':
        return '#dc3545';
      case 'guide':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }};
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin: 1rem 0;
  padding: 1rem;
  background: #d4edda;
  border-radius: 4px;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.$active ? '#007bff' : '#e9ecef'};
  color: ${props => props.$active ? 'white' : '#212529'};

  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#dee2e6'};
  }
`;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tours');
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'tours':
        return <TourManagement />;
      case 'users':
        return <UserManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <TourManagement />;
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Container>
      <Header>
        <h1>Панель администратора</h1>
        <p>Управляйте турами, пользователями и заказами</p>
      </Header>

      <TabsContainer>
        <Tab
          active={activeTab === 'tours'}
          onClick={() => setActiveTab('tours')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Управление турами
        </Tab>
        <Tab
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Управление пользователями
        </Tab>
        <Tab
          active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Управление заказами
        </Tab>
      </TabsContainer>

      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </Container>
  );
};

export default AdminPanel; 