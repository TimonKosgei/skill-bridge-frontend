import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import {jwtDecode} from 'jwt-decode';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(''); // For unconfirmed email messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle unconfirmed email case
        if (response.status === 403 && errorData.error.includes('Email not confirmed')) {
          setInfoMessage(errorData.error); // Display the message for unconfirmed email
          return;
        }

        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      const decodedToken = jwtDecode(data.token);
      if (decodedToken.role === 'Instructor') {
        navigate('/teacher-dashboard');
      } else if (decodedToken.role === 'Learner') {
        navigate('/home');
      } else {
        throw new Error('Invalid user role');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Welcome back</h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 p-3 bg-yellow-50 text-yellow-600 rounded-md">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;