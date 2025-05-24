/**
 * Utility functions for handling authentication
 */

/**
 * Gets the authentication header with the Bearer token
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Gets the authentication header with the Bearer token and Content-Type for JSON
 * @returns {Object} Headers object with Authorization token and Content-Type
 */
export const getAuthHeaderWithContentType = () => {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  };
};

/**
 * Checks if user is authenticated
 * @returns {boolean} True if token exists in localStorage
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Gets the user ID from the token
 * @returns {number|null} User ID if token exists and is valid, null otherwise
 */
export const getUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { user_id } = JSON.parse(jsonPayload);
    return user_id;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
}; 