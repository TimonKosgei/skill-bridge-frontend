import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/logout");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Logout successful:", data);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-blue-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="hover:underline">
            Skill Bridge
          </Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/home" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:underline">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/my-courses" className="hover:underline">
                My Courses
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:underline">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:underline">
                Sign Up
              </Link>
            </li>
            <li>
              <Link to="/upload-course" className="hover:underline">
                Upload Course
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="hover:underline bg-red-600 px-3 py-1 rounded-md text-white"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
