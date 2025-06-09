import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  
  console.log('PrivateRoute check:', {
    user,
    adminOnly,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    shouldRedirect: !user || (adminOnly && user?.role !== 'admin')
  });

  if (!user) {
    console.log('Redirecting to /auth - user not authenticated');
    return <Navigate to="/auth" />;
  }

  if (adminOnly && user.role !== 'admin') {
    console.log('Redirecting to / - user is not admin');
    return <Navigate to="/" />;
  }

  console.log('Rendering protected content');
  return children;
};

export default PrivateRoute; 