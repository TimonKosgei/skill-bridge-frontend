import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username,
          profile_picture: decoded.profile_picture_url,
          role: decoded.role, 
        });
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
  <Link to="/" className="flex items-center">
    <img 
      src="https://skillbridge28.s3.eu-north-1.amazonaws.com/photo_2025-05-02_19-59-20.jpg" 
      alt="SkillBridge Logo"
      className="h-8 w-8 rounded-full object-cover"
    />
    <span className="ml-2 text-xl font-bold text-gray-900">SkillBridge</span>
  </Link>
</div>

          {/* Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            {/* Home Link - Only for Learners */}
            {isLoggedIn && user?.role === "Learner" && (
              <Link 
                to="/home" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
            )}

            {/* Instructor Specific Links */}
            {isLoggedIn && user?.role === "Instructor" && (
              <>
                <Link 
                  to="/teacher-dashboard" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/upload-course" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Upload Course
                </Link>
              </>
            )}

            {/* Leaderboard Link - Only for Learners */}
            {isLoggedIn && user?.role === "Learner" && (
              <Link 
                to="/leaderboard" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Leaderboard
              </Link>
            )}

            {/* User Profile Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <Link 
                    to="/profile" 
                    className="ml-2 px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {user?.username}
                  </Link>
                </div>
                <button 
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;