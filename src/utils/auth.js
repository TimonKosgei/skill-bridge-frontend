import { useNavigate } from 'react-router-dom';

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        return exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};

/**
 * Gets the authentication header with JWT token
 * @returns {Object} - Object containing Authorization header
 */
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error('No token found in localStorage');
        return {};
    }

    if (isTokenExpired(token)) {
        console.error('Token is expired');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return {};
    }

    return {
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Hook for handling authentication
 * @returns {Object} - Object containing auth-related functions
 */
export const useAuth = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token && !isTokenExpired(token);
    };

    return {
        logout,
        isAuthenticated,
        getAuthHeader
    };
}; 