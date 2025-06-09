import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { logoutAsync } from '../store/slices/authSlice';
import { theme } from '../styles/theme';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${props => (props.$isOpen ? 'flex' : 'none')};
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    padding: 1rem 0;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0;
    text-align: center;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Footer = styled.footer`
  background-color: #333;
  color: #fff;
  padding: 2rem 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const FooterSection = styled.div`
  h3, h4 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const cartItems = useSelector(state => state.cart.items);

  const handleLogout = () => {
    dispatch(logoutAsync());
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <PageWrapper>
      <Header>
        <Nav>
          <Logo to="/" onClick={closeMenu}>ТурФирма</Logo>
          <MenuButton onClick={toggleMenu}>
            {isMenuOpen ? '✕' : '☰'}
          </MenuButton>
          <NavLinks $isOpen={isMenuOpen}>
            <NavLink to="/" onClick={closeMenu}>Главная</NavLink>
            <NavLink to="/tours" onClick={closeMenu}>Туры</NavLink>
            <NavLink to="/cart" onClick={closeMenu}>
              Корзина ({cartItems.length})
            </NavLink>
            {user ? (
              <>
                <NavLink to="/profile" onClick={closeMenu}>Профиль</NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" onClick={closeMenu}>
                    Админ панель
                  </NavLink>
                )}
                <NavLink to="#" onClick={() => { handleLogout(); closeMenu(); }}>
                  Выйти
                </NavLink>
              </>
            ) : (
              <NavLink to="/auth" onClick={closeMenu}>Войти</NavLink>
            )}
          </NavLinks>
        </Nav>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        <FooterContent>
          <FooterSection>
            <h3>О компании</h3>
            <p>Мы организуем незабываемые туры по самым красивым местам.</p>
          </FooterSection>
          <FooterSection>
            <h4>Навигация</h4>
            <FooterLinks>
              <NavLink to="/" style={{ color: '#fff' }}>Главная</NavLink>
              <NavLink to="/tours" style={{ color: '#fff' }}>Туры</NavLink>
              <NavLink to="/auth" style={{ color: '#fff' }}>Личный кабинет</NavLink>
            </FooterLinks>
          </FooterSection>
        </FooterContent>
      </Footer>
    </PageWrapper>
  );
};

export default Layout; 