import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course_image_url, title, instructor, duration, rating, isEnrolled, course_id,description }) => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [enrollmentDetails, setEnrollmentDetails] = useState({ enrollment_date: '', progress: 0 });

  useEffect(() => {
    const fetchEnrollmentDetails = async () => {
      if (enrolled) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/enrollment/${course_id}`);
          if (response.ok) {
            const data = await response.json();
            setEnrollmentDetails(data);
          }
        } catch (error) {
          console.error("Failed to fetch enrollment details:", error);
        }
      }
    };
    fetchEnrollmentDetails();
  }, [enrolled, course_id]);

  const handleEnroll = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: course_id,
          user_id: 1, // Assuming user_id is 1 for now, replace with actual user_id
          enrollment_date: new Date().toISOString(),
          progress: 0
        })
      });
      if (response.status === 201) {
        const data = await response.json();
        navigate(`/courses/${course_id}`);
        setEnrolled(true);
        setEnrollmentDetails(data); // Update enrollment details
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  const handleViewCourse = () => {
    navigate(`/courses/${course_id}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg w-72 h-auto">
      <img src={course_image_url} alt={title} className="mb-4 rounded w-full h-36 object-cover" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-2">By {instructor.first_name} {instructor.last_name}</p>
      <p className="text-gray-700 mb-2">duration: {duration}</p>
      <p className="text-gray-700 mb-2">Rating: {rating}</p>
      {enrolled && (
        <div className="text-gray-700 mb-2">
          <p>Enrollment Date: {new Date(enrollmentDetails.enrollment_date).toLocaleDateString()}</p>
          <p>Progress: {enrollmentDetails.progress}%</p>
        </div>
      )}
      <div className="flex flex-col space-y-2">
        {enrolled ? (
          <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Learn</button>
        ) : (
          <button onClick={handleEnroll} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Enroll</button>
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
