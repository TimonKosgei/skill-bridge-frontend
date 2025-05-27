import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import { getAuthHeader } from '../utils/authUtils';

const InstructorProfile = () => {
  const [decodedToken, setDecodedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({});
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (error) {
        console.error('Token decoding failed:', error);
        setError('Invalid token. Please log in again.');
        setIsLoadingUser(false);
        setIsLoading(false);
        return;
      }
    } else {
      setError('No token found. Please log in.');
      setIsLoadingUser(false);
      setIsLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!decodedToken) return;

    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}`, {
          headers: getAuthHeader()
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        setUser(userData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [decodedToken]);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setNotification({
        type: 'error',
        message: 'Please upload a valid image file (JPEG, PNG, or GIF)'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'File size must be less than 5MB'
      });
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}/profile-photo`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile photo');
      }

      const data = await response.json();
      setUser(prevUser => ({
        ...prevUser,
        profile_picture_url: data.profile_picture_url
      }));

      setNotification({
        type: 'success',
        message: 'Profile photo updated successfully!'
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to upload profile photo. Please try again.'
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Instructor Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {isLoadingUser ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column - Profile Info */}
              <div className="md:w-1/3">
                <div className="relative">
                  <img
                    src={user.profile_picture_url || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <LoadingSpinner size="small" />
                    </div>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="mt-2 text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Right Column - About & Stats */}
              <div className="md:w-2/3">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {user.bio || "Share your teaching experience, expertise, and what students can expect from your courses..."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Profile Settings</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Update Your Information
              </p>
            </div>

            {/* Profile Photo Upload Section */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col items-center space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  id="profile-photo-upload"
                />
                <label
                  htmlFor="profile-photo-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingPhoto ? 'Uploading...' : 'Change Profile Photo'}
                </label>
                <p className="text-sm text-gray-500">
                  JPG, PNG or GIF. Max size: 5MB
                </p>
              </div>
            </div>

            <form
              className="space-y-6 max-w-2xl mx-auto"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);

                const updatedUser = {
                  username: e.target.username.value.trim(),
                  first_name: e.target.first_name.value.trim(),
                  last_name: e.target.last_name.value.trim(),
                  email: e.target.email.value.trim(),
                  bio: e.target.bio.value.trim(),
                };

                try {
                  const response = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      ...getAuthHeader(),
                    },
                    body: JSON.stringify(updatedUser),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to update profile');
                  }

                  const updatedData = await response.json();
                  setUser(updatedData);
                  setNotification({
                    type: 'success',
                    message: 'Profile updated successfully!'
                  });
                } catch (error) {
                  console.error('Error updating profile:', error);
                  setNotification({
                    type: 'error',
                    message: error.message || 'Failed to update profile. Please try again.'
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    defaultValue={user.username}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    defaultValue={user.first_name}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    defaultValue={user.last_name}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={user.email}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    About Me
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    defaultValue={user.bio}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Write about your teaching experience, expertise, and what students can expect from your courses..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This description will be visible to your students. Share your teaching philosophy, expertise, and what makes your courses unique.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile; 