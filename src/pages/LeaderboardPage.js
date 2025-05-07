import { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setIsLoadingBadges(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${user.user_id}/badges`);
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }
      const badges = await response.json();
      setUserBadges(badges);
    } catch (err) {
      console.error('Error fetching badges:', err);
    } finally {
      setIsLoadingBadges(false);
    }
  };

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

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderProfilePicture = (user) => {
    if (user.profile_picture) {
      return (
        <img 
          src={user.profile_picture} 
          alt={user.name} 
          className="h-10 w-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-blue-600 font-medium">
          {getInitials(user.name || user.user_name)}
        </span>
      </div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Leaderboard
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            See how you rank among our top learners
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Top Learners</h2>
                  <span className="text-sm font-medium text-gray-500">
                    {users.length} {users.length === 1 ? 'participant' : 'participants'}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <div 
                    key={user.user_id} 
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 text-center">
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          index === 2 ? 'text-yellow-700' : 
                          'text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-4 flex items-center">
                        {renderProfilePicture(user)}
                        <div className="ml-4">
                          <h3 className="text-md font-medium text-gray-900">{user.name}</h3>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {user.total_xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedUser ? `${selectedUser.name || selectedUser.user_name}'s Badges` : 'Select a user to view badges'}
                </h2>
              </div>
              
              <div className="p-6">
                {isLoadingBadges ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : selectedUser ? (
                  <>
                    {/* User Profile Info */}
                    <div className="mb-6 text-center">
                      {selectedUser.profile_picture ? (
                        <img 
                          src={selectedUser.profile_picture} 
                          alt={selectedUser.name} 
                          className="h-24 w-24 rounded-full object-cover mx-auto mb-4 shadow-md"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-semibold mx-auto mb-4 shadow-md">
                          <span className="text-blue-600">
                            {getInitials(selectedUser.name)}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name }</h3>
                      {selectedUser.profile_url && (
                        <a 
                          href={selectedUser.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          View Profile
                        </a>
                      )}
                      {selectedUser.bio && (
                        <p className="mt-3 text-gray-600 text-sm italic">
                          "{selectedUser.bio}"
                        </p>
                      )}
                    </div>

                    {/* Badges Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Badges Earned</h4>
                      {userBadges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {userBadges.map((userBadge) => (
                            <div 
                              key={userBadge.user_badge_id}
                              className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className={`${getTierColor(userBadge.badge.tier)} p-4 rounded-full mb-3 shadow-md`}>
                                <span className="text-3xl">{userBadge.badge.emoji}</span>
                              </div>
                              <h4 className="font-medium text-center text-gray-900">{userBadge.badge.name}</h4>
                              <p className="text-sm text-gray-500 text-center mt-1">{userBadge.badge.description}</p>
                              <div className="mt-2 flex items-center">
                                <span className="text-xs font-semibold text-blue-600">
                                  +{userBadge.badge.xp_value} XP
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No badges earned yet.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Click on a user to view their profile and badges</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Leaderboard updates every 24 hours. Keep learning to climb the ranks!</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;