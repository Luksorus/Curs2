import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { logoutAsync } from '../store/slices/authSlice';
import { theme } from '../styles/theme';

const Nav = styled.nav`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    gap: 1rem;
    z-index: 1;
  }
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.5rem 0;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #c82333;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 2;

  @media (max-width: 768px) {
    display: block;
  }
`;

const CartLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .cart-count {
    background: #dc3545;
    color: white;
    border-radius: 50%;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    position: absolute;
    top: -8px;
    right: -12px;
  }
`;

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  console.log('Current user:', user);
  console.log('Is user logged in?:', !!user);
  console.log('User role:', user?.role);
  console.log('Should show admin panel?:', user?.role === 'admin');

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Nav>
      <Container>
        <Logo to="/" onClick={closeMenu}>Туристическая компания</Logo>
        <MenuButton onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </MenuButton>
        <NavLinks isOpen={isMenuOpen}>
          <NavLink to="/tours" onClick={closeMenu}>Туры</NavLink>
          <CartLink to="/cart" onClick={closeMenu}>
            Корзина
            {cartItems.length > 0 && (
              <span className="cart-count">{cartItems.length}</span>
            )}
          </CartLink>
          {user ? (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={closeMenu}>Админ панель</NavLink>
              )}
              <NavLink to="/profile" onClick={closeMenu}>Профиль</NavLink>
              <Button onClick={handleLogout}>Выйти</Button>
            </>
          ) : (
            <NavLink to="/auth" onClick={closeMenu}>Войти</NavLink>
          )}
        </NavLinks>
      </Container>
    </Nav>
  );
};

export default Navigation; 