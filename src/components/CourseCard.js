import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const CourseCard = ({ lessons, course_image_url, title, instructor, isEnrolled, course_id, description }) => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [enrollmentDetails, setEnrollmentDetails] = useState({ enrollment_date: '', progress: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const duration = () => {
    const totalSeconds = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateRating = () => {
    const ratings = lessons.flatMap((lesson) => lesson.lesson_reviews?.map((review) => review.rating) || []);
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <span style={{ color: "#D69E2E" }}>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </span>
    );
  };

  const rating = calculateRating();

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        const decodedToken = jwtDecode(token);
        const user_id = decodedToken.user_id; // Extract user_id from the decoded token

        const response = await fetch(`http://127.0.0.1:5000/users/${user_id}`);
        if (response.ok) {
          const user = await response.json();
          const enrollment = user.enrollments.find((e) => e.course_id === course_id);
          if (enrollment) {
            setEnrolled(true);
            setEnrollmentDetails(enrollment);
          } else {
            setEnrolled(false);
          }
        } else {
          console.error('Failed to fetch user data:', response.statusText);
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: course_id,
          user_id: user_id,
          enrollment_date: new Date().toISOString(),
          progress: 0,
        }),
      });
      
      if (response.status === 201) {
        const data = await response.json();
        setEnrolled(true);
        setEnrollmentDetails(data);
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert("Failed to enroll. Please try again.");
    }
  };

  const handleLearn = () => navigate(`/courses/${course_id}`);
  const handleViewCourse = () => navigate(`/preview/${course_id}`);

  return (
    <div 
      style={{
        width: "320px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: isHovered 
          ? "0 10px 25px rgba(0, 0, 0, 0.1)" 
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course Image */}
      <div style={{ 
        height: "180px", 
        overflow: "hidden",
        position: "relative"
      }}>
        <img 
          src={course_image_url} 
          alt={title} 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }} 
        />
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          backgroundColor: "rgba(0, 123, 255, 0.9)",
          color: "white",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "600"
        }}>
          {duration()}
        </div>
      </div>

      {/* Course Content */}
      <div style={{ padding: "20px" }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "700", 
          color: "#2D3748",
          marginBottom: "8px",
          lineHeight: "1.4"
        }}>
          {title}
        </h3>
        
        <p style={{ 
          fontSize: "14px", 
          color: "#4A5568", 
          marginBottom: "12px",
          lineHeight: "1.5"
        }}>
          {description.length > 100 ? `${description.substring(0, 100)}...` : description}
        </p>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "16px"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#E2E8F0",
            backgroundImage: instructor.profile_picture_url ? `url(${instructor.profile_picture_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginRight: "12px"
          }} />
          <span style={{ 
            fontSize: "14px", 
            color: "#4A5568"
          }}>
            {instructor.first_name} {instructor.last_name}
          </span>
        </div>

        {/* Rating */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "20px"
        }}>
          {rating !== null ? (
            <>
              <span style={{ 
                fontSize: "16px", 
                fontWeight: "600", 
                color: "#2D3748",
                marginRight: "8px"
              }}>
                {rating.toFixed(1)}
              </span>
              {renderStars(rating)}
              <span style={{ 
                fontSize: "14px", 
                color: "#718096",
                marginLeft: "8px"
              }}>
                ({lessons.flatMap(l => l.lesson_reviews || []).length})
              </span>
            </>
          ) : (
            <span style={{ 
              fontSize: "14px", 
              color: "#718096"
            }}>
              No ratings yet
            </span>
          )}
        </div>

        {/* Progress (if enrolled) */}
        {enrolled && (
          <div style={{ 
            marginBottom: "20px",
            backgroundColor: "#EDF2F7",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <div style={{ 
              width: `${enrollmentDetails.progress}%`,
              height: "6px",
              backgroundColor: "#007BFF",
              borderRadius: "8px"
            }} />
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginTop: "8px"
            }}>
              <span style={{ 
                fontSize: "12px", 
                color: "#4A5568"
              }}>
                {enrollmentDetails.progress}% Complete
              </span>
              <span style={{ 
                fontSize: "12px", 
                color: "#4A5568"
              }}>
                Enrolled on {new Date(enrollmentDetails.enrollment_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px",
          marginTop: "16px"
        }}>
          {enrolled ? (
            <button
              onClick={handleLearn}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                ":hover": {
                  backgroundColor: "#0069D9"
                }
              }}
            >
              Continue Learning
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                ":hover": {
                  backgroundColor: "#0069D9"
                }
              }}
            >
              Enroll Now
            </button>
          )}
          
          <button
            onClick={handleViewCourse}
            style={{
              padding: "12px",
              backgroundColor: "transparent",
              color: "#007BFF",
              border: "1px solid #007BFF",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              ":hover": {
                backgroundColor: "#007BFF10"
              }
            }}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;