import React, { useState } from 'react';
import styled from 'styled-components';
import TourManagement from './TourManagement';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: calc(100vh - 80px);
  background: ${theme.colors.background};
`;

const Sidebar = styled.div`
  background: ${theme.colors.backgroundAlt};
  padding: 2rem;
  box-shadow: ${theme.shadows.medium};
  border-right: 1px solid ${theme.colors.border};

  h2 {
    color: ${theme.colors.text};
    margin-bottom: 2rem;
    font-size: 1.5rem;
    position: relative;
    padding-bottom: 1rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: ${theme.colors.primary};
      border-radius: ${theme.borderRadius.small};
    }
  }
`;

const Content = styled.div`
  background: ${theme.colors.background};
  padding: 2rem;
`;

const NavItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border-radius: ${theme.borderRadius.medium};
  color: ${props => props.active ? 'white' : theme.colors.text};
  background: ${props => props.active ? theme.colors.primary : 'transparent'};
  transition: all ${theme.transitions.fast};
  font-weight: 500;

  &:hover {
    background: ${props => props.active ? theme.colors.primaryDark : theme.colors.primary}20;
    transform: translateX(5px);
  }

  svg {
    margin-right: 0.5rem;
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }
`;

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('tours');

  const renderContent = () => {
    switch (activeSection) {
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

  return (
    <Container>
      <Sidebar>
        <h2>Админ панель</h2>
        <NavItem
          active={activeSection === 'tours'}
          onClick={() => setActiveSection('tours')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Управление турами
        </NavItem>
        <NavItem
          active={activeSection === 'users'}
          onClick={() => setActiveSection('users')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Управление пользователями
        </NavItem>
        <NavItem
          active={activeSection === 'orders'}
          onClick={() => setActiveSection('orders')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Управление заказами
        </NavItem>
      </Sidebar>
      <Content>
        {renderContent()}
      </Content>
    </Container>
  );
};

export default AdminPanel; 