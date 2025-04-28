import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true); // Set loading to true

    try {
      const response = await fetch('http://127.0.0.1:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send password reset email');
      }

      const data = await response.json();
      setMessage(data.message || 'Password reset email sent successfully');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Forgot Password</h2>

          {message && (
            <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-md">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
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
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading} // Disable the button when loading
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Remembered your password?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;