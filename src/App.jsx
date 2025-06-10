import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { GlobalStyles } from './styles/GlobalStyles';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetails from './pages/TourDetails';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminPanel from './components/admin/AdminPanel';
import Cart from './pages/Cart';
import PrivateRoute from './components/PrivateRoute';


const AuthDebugger = () => {
  const auth = useSelector((state) => state.auth);
  console.log('Current auth state:', {
    auth,
    token: localStorage.getItem('token'),
    user: auth.user,
    isAuthenticated: !!auth.user,
    isGuide: auth.user?.role === 'guide',
    isAdmin: auth.user?.role === 'admin'
  });
  return null;
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <GlobalStyles />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tours" element={<Tours />} />
            <Route path="tours/:id" element={<TourDetails />} />
            <Route path="auth" element={<Auth />} />
            <Route path="cart" element={<Cart />} />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
