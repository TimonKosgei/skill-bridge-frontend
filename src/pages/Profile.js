import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { jwtDecode } from 'jwt-decode';
import SimpleCourseCard from '../components/SimpleCourseCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const [decodedToken, setDecodedToken] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBadge, setNewBadge] = useState(null);
  const [user, setUser] = useState({});
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

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
        const userResponse = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch badges
        const badgesResponse = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}/badges`);
        if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);

        // Populate enrolled courses from user.enrollments
        if (userData.enrollments) {
          const courses = userData.enrollments.map(enrollment => ({
            ...enrollment.course,
            progress: enrollment.progress,
          }));
          setEnrolledCourses(courses);
        }

        if (badgesData.length > 0) {
          const newestBadge = badgesData[badgesData.length - 1];
          setNewBadge(newestBadge);
          setTimeout(() => setNewBadge(null), 5000);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
    const interval = setInterval(fetchUserData, 30000);
    return () => clearInterval(interval);
  }, [decodedToken]);

  // Group enrolled courses by completion status
  const completedCourses = enrolledCourses.filter(course => course.progress === 100);
  const inProgressCourses = enrolledCourses.filter(course => course.progress > 0 && course.progress < 100);
  const notStartedCourses = enrolledCourses.filter(course => course.progress === 0);

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'bg-amber-500',
      silver: 'bg-gray-300',
      gold: 'bg-yellow-400',
      platinum: 'bg-blue-300',
      default: 'bg-purple-400'
    };
    return colors[tier] || colors.default;
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}/profile-photo`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
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

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 z-50 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg';
      successMsg.textContent = 'Profile photo updated successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded-md shadow-lg';
      errorMsg.textContent = error.message || 'Failed to upload profile photo. Please try again.';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
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

      {/* New Badge Notification */}
      {newBadge && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="flex items-start p-4 max-w-md bg-white rounded-lg shadow-xl border-l-4 border-green-500">
            <div className={`${getTierColor(newBadge.badge.tier)} p-3 rounded-full mr-3 flex-shrink-0`}>
              <span className="text-2xl">{newBadge.badge.emoji}</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-gray-900">New Badge Earned!</h3>
              <p className="text-gray-700">{newBadge.badge.name}</p>
              <p className="text-sm text-gray-500">{newBadge.badge.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(newBadge.earned_date).toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => setNewBadge(null)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Profile Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-12 sm:px-6 lg:px-8 text-center">
          {isLoadingUser ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <>
              <div className="relative mx-auto">
                <img
                  src={user.profile_picture_url || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4 mx-auto"
                />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {user.name}
              </h1>
              <p className="mt-2 max-w-lg mx-auto text-lg text-gray-500">
                {user.bio || "Welcome to your SkillBridge profile!"}
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {enrolledCourses.length} Courses
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {badges.length} Badges
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm isolate">
            {[
              { id: 'courses', label: '📚 My Courses' },
              { id: 'badges', label: '🏆 Badges' },
              { id: 'activity', label: '📝 Activity' },
              { id: 'settings', label: '⚙️ Settings' }
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  index === 0 ? 'rounded-l-lg' : 
                  index === 3 ? 'rounded-r-lg' : 
                  'rounded-none'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {activeTab === 'courses' && (
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="large" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-lg">Error loading courses: {error}</p>
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">No courses yet</h4>
                  <p className="text-gray-500 mt-1">
                    <Link to="/courses" className="text-blue-600 hover:underline">
                      Browse courses
                    </Link> to get started!
                  </p>
                </div>
              ) : (
                <>
                  {/* In Progress and Not Started Courses */}
                  {(inProgressCourses.length > 0 || notStartedCourses.length > 0) && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Current Courses</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...inProgressCourses, ...notStartedCourses].map(course => (
                          <SimpleCourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Courses */}
                  {completedCourses.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Completed Courses</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedCourses.map(course => (
                          <SimpleCourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="large" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-lg">Error loading badges: {error}</p>
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">No badges yet</h4>
                  <p className="text-gray-500 mt-1">Complete challenges to earn your first badge!</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Achievements</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      Your Badge Collection
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {badges.map((userBadge) => (
                      <div 
                        key={userBadge.user_badge_id}
                        className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className={`${getTierColor(userBadge.badge.tier)} p-4 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                          <span className="text-3xl">{userBadge.badge.emoji}</span>
                        </div>
                        <h4 className="font-medium text-center text-gray-900">{userBadge.badge.name}</h4>
                        <p className="text-sm text-gray-500 text-center mt-1">{userBadge.badge.description}</p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs font-semibold text-blue-600">
                            +{userBadge.badge.xp_value} XP
                          </span>
                          <span className="mx-1 text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(userBadge.earned_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">History</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Your Learning Activity
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">No activity yet</h4>
                  <p className="text-gray-500 mt-1">Your learning activity will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {badges.map((userBadge) => (
                    <div key={userBadge.user_badge_id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <div className={`${getTierColor(userBadge.badge.tier)} p-2 rounded-full mr-4 flex-shrink-0`}>
                          <span className="text-xl">{userBadge.badge.emoji}</span>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-gray-800">
                            Earned the <span className="font-semibold">{userBadge.badge.name}</span> badge
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{userBadge.badge.description}</p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span>{new Date(userBadge.earned_date).toLocaleString()}</span>
                            <span className="mx-2">•</span>
                            <span className="font-semibold text-blue-600">+{userBadge.badge.xp_value} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Preferences</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Profile Settings
                </p>
              </div>

              {/* Profile Photo Upload Section */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={user.profile_picture_url || "https://via.placeholder.com/150"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <LoadingSpinner size="small" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-2">
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
                      {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    </label>
                    <p className="text-sm text-gray-500">
                      JPG, PNG or GIF. Max size: 5MB
                    </p>
                  </div>
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

                  const token = localStorage.getItem('token');

                  try {
                    const response = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(updatedUser),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to update profile');
                    }

                    const updatedData = await response.json();
                    setUser(updatedData);
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'fixed top-4 right-4 z-50 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg';
                    successMsg.textContent = 'Profile updated successfully!';
                    document.body.appendChild(successMsg);
                    setTimeout(() => successMsg.remove(), 3000);
                  } catch (error) {
                    console.error('Error updating profile:', error);
                    
                    // Show error message
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded-md shadow-lg';
                    errorMsg.textContent = error.message || 'Failed to update profile. Please try again.';
                    document.body.appendChild(errorMsg);
                    setTimeout(() => errorMsg.remove(), 3000);
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
                    <p className="mt-1 text-sm text-gray-500">
                      This will be your unique identifier on the platform
                    </p>
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
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      defaultValue={user.bio}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Brief description for your profile. Maximum 200 characters.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
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
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;