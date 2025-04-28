import { useState, useEffect } from 'react';
import Header from '../components/Header';

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
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
              <div key={user.user_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
                    <img 
                      src={user.profile_picture || "https://via.placeholder.com/40"} 
                      alt={user.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
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

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Leaderboard updates every 24 hours. Keep learning to climb the ranks!</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;