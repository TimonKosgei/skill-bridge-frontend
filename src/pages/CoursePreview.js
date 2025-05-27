import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ReactPlayer from 'react-player';
import Header from '../components/Header';
import { getAuthHeader } from '../utils/authUtils';
import VideoPlayer from '../components/VideoPlayer';

const CoursePreview = () => {
  const navigate = useNavigate();
  const { course_id } = useParams();
  const [course, setCourse] = useState({});
  const [lessons, setLessons] = useState([]);
  const [instructor, setInstructor] = useState({});
  const [user, setUser] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [visibleReviews, setVisibleReviews] = useState({});
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ user_id: decodedToken.user_id, username: decodedToken.username });
        // Check if user is an instructor
        setIsInstructor(decodedToken.role === 'Instructor');
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }

    fetch(`http://127.0.0.1:5000/courses/${course_id}`, {
      headers: getAuthHeader()
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCourse(data);
        setLessons(data.lessons);
        setInstructor(data.instructor);
        setIsEnrolled(data.isEnrolled);
      })
      .catch((error) => console.error("Error fetching course data:", error));

    fetch(`http://127.0.0.1:5000/discussions?course_id=${course_id}`, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then((data) => setDiscussions(data))
      .catch((error) => console.error("Error fetching discussions:", error));
  }, [course_id]);

  const handleEnroll = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/enrollments", {
        method: "POST",
        headers: { 
          ...getAuthHeader(),
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          course_id: course_id,
          user_id: user.user_id,
          enrollment_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsEnrolled(true);
        navigate(`/courses/${course_id}`);
      } else {
        throw new Error("Failed to enroll.");
      }
    } catch (error) {
      console.error("Error enrolling:", error);
    }
  };

  const handleLoadMoreReviews = (lessonId) => {
    setVisibleReviews((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || 3) + 3,
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateCourseRating = () => {
    const ratings = lessons.flatMap((lesson) => lesson.lesson_reviews?.map((review) => review.rating) || []);
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const calculateTotalDuration = () => {
    const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const courseRating = calculateCourseRating();

  // Helper functions for ratings and reviews
  const calculateAverageRating = (lessons) => {
    if (!lessons || lessons.length === 0) return 0;
    const allReviews = lessons.flatMap(lesson => lesson.lesson_reviews || []);
    if (allReviews.length === 0) return 0;
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / allReviews.length).toFixed(1);
  };

  const calculateTotalReviews = (lessons) => {
    if (!lessons || lessons.length === 0) return 0;
    return lessons.reduce((total, lesson) => total + (lesson.lesson_reviews?.length || 0), 0);
  };

  const getRecentReviews = (lessons) => {
    if (!lessons || lessons.length === 0) return [];
    const allReviews = lessons.flatMap(lesson => 
      (lesson.lesson_reviews || []).map(review => ({
        ...review,
        lesson_title: lesson.title
      }))
    );
    return allReviews
      .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
      .slice(0, 5); // Get only the 5 most recent reviews
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button for Instructors */}
        {isInstructor && (
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        )}

        {/* Course Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Course Image */}
            <div className="md:w-1/2 h-[300px] md:h-[400px]">
              <img 
                src={course.course_image_url} 
                alt={course.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Course Info */}
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{course.lessons?.length || 0} Lessons</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{calculateTotalDuration(course.lessons)}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{course.enrollments?.length || 0} Students Enrolled</span>
                </div>
              </div>

              {!isInstructor && (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolled}
                  className={`mt-6 w-full px-6 py-3 rounded-lg text-white font-medium ${
                    isEnrolled 
                      ? 'bg-green-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
            <div className="space-y-2">
              {course.lessons?.map((lesson, index) => (
                <div 
                  key={lesson.lesson_id}
                  className="flex items-start py-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                    <p className="text-gray-600 mt-1">{lesson.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Stats and Reviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-yellow-500">★</span>
                    <span className="ml-1 text-gray-900 font-medium">
                      {calculateAverageRating(course.lessons)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="text-gray-900 font-medium">
                    {calculateTotalReviews(course.lessons)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
              <div className="space-y-4">
                {getRecentReviews(course.lessons).map((review) => (
                  <div key={review.review_id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {new Date(review.review_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Matching the landing page */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-300">© 2025 SkillBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CoursePreview;