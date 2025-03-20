import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course_image_url, title, instructor, duration, rating, isEnrolled, course_id }) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/courses/${course_id}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg w-72 h-auto">
      <img src={course_image_url} alt={title} className="mb-4 rounded w-full h-36 object-cover" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-2">By {instructor.first_name}</p>
      <p className="text-gray-700 mb-2">Duration: {duration}</p>
      <p className="text-gray-700 mb-2">Rating: {rating}</p>
      <div className="flex flex-col space-y-2">
        {isEnrolled ? (
          <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Learn</button>
        ) : (
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Enroll</button>
        )}
        <button
          onClick={handleViewCourse}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          View Course
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
