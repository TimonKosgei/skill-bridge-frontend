import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { jwtDecode } from 'jwt-decode';

const ProfilePage = () => {
  const [decodedToken, setDecodedToken] = useState(null);
  const [activeTab, setActiveTab] = useState('badges');
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBadge, setNewBadge] = useState(null);
  const [user, setUser] = useState({});
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

    const fetchUserAndBadges = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch badges
        const badgesResponse = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}/badges`);
        if (!badgesResponse.ok) {
          throw new Error('Failed to fetch badges');
        }
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);

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

    fetchUserAndBadges();
    const interval = setInterval(fetchUserAndBadges, 30000);
    return () => clearInterval(interval);
  }, [decodedToken]); 

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          {isLoadingUser ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 mb-2">{user.email}</p>
              <p className="text-gray-600 max-w-md">{user.bio}</p>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm isolate">
            {[
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
                  index === 2 ? 'rounded-r-lg' : 
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
          {activeTab === 'badges' && (
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading badges: {error}
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Badges</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {badges.map((userBadge) => (
                      <div 
                        key={userBadge.user_badge_id}
                        className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className={`${getTierColor(userBadge.badge.tier)} p-3 rounded-full mb-2 group-hover:scale-110 transition-transform`}>
                          <span className="text-3xl">{userBadge.badge.emoji}</span>
                        </div>
                        <h4 className="font-medium text-center text-gray-900">{userBadge.badge.name}</h4>
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(userBadge.earned_date).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 mt-1">
                          +{userBadge.badge.xp_value} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {badges.map((userBadge) => (
                    <div key={userBadge.user_badge_id} className="py-4 first:pt-0 last:pb-0 flex items-start">
                      <div className={`${getTierColor(userBadge.badge.tier)} p-2 rounded-full mr-3 flex-shrink-0`}>
                        <span className="text-xl">{userBadge.badge.emoji}</span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">
                          Earned <span className="font-semibold">{userBadge.badge.name}</span> badge
                        </p>
                        <p className="text-sm text-gray-500">{userBadge.badge.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(userBadge.earned_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 text-sm font-semibold text-blue-600 whitespace-nowrap">
                        +{userBadge.badge.xp_value} XP
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    defaultValue={user.bio}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
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