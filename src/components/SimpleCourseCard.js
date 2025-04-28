import React from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleCourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img
        src={course.course_image_url || 'https://via.placeholder.com/300x200'}
        alt={course.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
        <button
          onClick={() => navigate(`/courses/${course.course_id}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Learn
        </button>
      </div>
    </div>
  );
};

export default SimpleCourseCard;