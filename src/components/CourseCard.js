import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getAuthHeader } from '../utils/authUtils';

const CourseCard = ({ 
  lessons = [], 
  course_image_url, 
  title, 
  instructor = {}, 
  isEnrolled, 
  course_id, 
  description = '',
  enrollmentDetails = {},
  category = ''
}) => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [progress, setProgress] = useState(enrollmentDetails.progress || 0);
  const [hovered, setHovered] = useState(false);

  const duration = () => {
    const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateRating = () => {
    const ratings = lessons.flatMap(lesson => lesson.lesson_reviews?.map(review => review.rating) || []);
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i < fullStars ? 'text-yellow-400' : (hasHalfStar && i === fullStars ? 'text-yellow-400' : 'text-gray-300')}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-500">({lessons.flatMap(l => l.lesson_reviews || []).length})</span>
      </div>
    );
  };

  const rating = calculateRating();

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const decodedToken = jwtDecode(token);
        const user_id = decodedToken.user_id;

        const response = await fetch(`http://127.0.0.1:5000/users/${user_id}`, {
          headers: getAuthHeader()
        });
        if (response.ok) {
          const user = await response.json();
          const enrollment = user.enrollments.find(e => e.course_id === course_id);
          if (enrollment) {
            setEnrolled(true);
            setProgress(enrollment.progress || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
      }
    };
    fetchEnrollmentStatus();
  }, [course_id]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const decodedToken = jwtDecode(token);
      const user_id = decodedToken.user_id;

      const response = await fetch(`http://127.0.0.1:5000/enrollments`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: course_id,
          user_id: user_id,
          enrollment_date: new Date().toISOString(),
          progress: 0,
        }),
      });
      
      if (response.status === 201) {
        setEnrolled(true);
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const handleLearn = () => navigate(`/courses/${course_id}`);
  const handleViewCourse = () => navigate(`/preview/${course_id}`);

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 ${
        hovered ? 'transform -translate-y-1 shadow-lg' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course_image_url} 
          alt={title} 
          className={`w-full h-full object-cover transition-transform duration-300 ${
            hovered ? 'scale-105' : 'scale-100'
          }`}
        />
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {duration()}
        </div>
        {category && (
          <div className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {category}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center mb-4">
          <div className={`w-8 h-8 rounded-full ${
            instructor.profile_picture_url ? 'bg-cover bg-center' : 'bg-gray-200'
          }`} style={{
            backgroundImage: instructor.profile_picture_url ? `url(${instructor.profile_picture_url})` : 'none'
          }} />
          <span className="ml-3 text-gray-700">
            {instructor.first_name} {instructor.last_name}
          </span>
        </div>

        {/* Rating */}
        <div className="mb-4">
          {rating !== null ? (
            <div className="flex items-center">
              <span className="text-gray-900 font-semibold mr-2">{rating.toFixed(1)}</span>
              {renderStars(rating)}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No ratings yet</span>
          )}
        </div>

        {/* Progress (if enrolled) */}
        {enrolled && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progress}% Complete</span>
              {enrollmentDetails.enrollment_date && (
                <span>Enrolled on {new Date(enrollmentDetails.enrollment_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {enrolled ? (
            <button
              onClick={handleLearn}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Continue Learning
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Enroll Now
            </button>
          )}
          
          <button
            onClick={handleViewCourse}
            className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 py-2 px-4 rounded-md font-medium transition-colors"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;