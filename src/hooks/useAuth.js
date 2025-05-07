import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const isAuthenticated = () => {
    return !!getToken();
  };

  const isInstructor = () => {
    return getUserRole() === 'Instructor';
  };

  const isLearner = () => {
    return getUserRole() === 'Learner';
  };

  return {
    getToken,
    getUserRole,
    isAuthenticated,
    isInstructor,
    isLearner
  };
}; 