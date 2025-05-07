import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, getUserRole } = useAuth();
  const userRole = getUserRole();

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // If role is not allowed, redirect to appropriate page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'Instructor' ? '/teacher-dashboard' : '/home'} />;
  }

  return children;
};

export default AuthRoute; 