import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">Skill Bridge</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/home" className="hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">Login</Link>
            </li>
            <li>
              <Link to="/signup" className="hover:underline">Sign Up</Link>
            </li>
            <li>
              <Link to="/courses" className="hover:underline">Courses</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;