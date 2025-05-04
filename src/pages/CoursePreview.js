import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ user_id: decodedToken.user_id, username: decodedToken.username });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }

    fetch(`http://127.0.0.1:5000/courses/${course_id}`)
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
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => response.json())
      .then((data) => setDiscussions(data))
      .catch((error) => console.error("Error fetching discussions:", error));
  }, [course_id]);

  const handleEnroll = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Matching the landing page */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-17h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">SkillBridge</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                My Profile
              </Link>
              <Link to="/courses" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Browse Courses
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Course Image */}
          <div className="flex-1 min-w-[300px] rounded-xl overflow-hidden shadow-lg h-[300px] bg-white">
            <img 
              src={course.course_image_url} 
              alt={course.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Course Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-5 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 text-sm font-medium text-gray-800">
                  ⏱️ {calculateTotalDuration()}
                </div>
                
                {courseRating && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 text-sm font-medium text-gray-800">
                    <span className="text-yellow-400">★</span>
                    {courseRating.toFixed(1)} ({lessons.flatMap(l => l.lesson_reviews || []).length} reviews)
                  </div>
                )}
              </div>
            </div>
            
            {/* Instructor Preview */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={instructor.profile_picture_url}
                alt={instructor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <p className="text-sm text-gray-500 mb-1">Instructor</p>
                <h3 className="text-base font-semibold text-gray-800">
                  {instructor.first_name} {instructor.last_name}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          {['lessons', 'instructor', 'discussions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === "lessons" ? "📖 Lessons" : 
               tab === "instructor" ? "👨‍🏫 Instructor" : 
               "💬 Discussions"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {activeTab === "lessons" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Lessons
              </h2>
              
              <div className="space-y-5">
                {lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Lesson Header */}
                    <div className="flex items-center p-5 bg-gray-50 cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-semibold mr-4 shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDuration(lesson.duration)}</span>
                          {lesson.lesson_reviews?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              {(lesson.lesson_reviews.reduce((sum, review) => sum + review.rating, 0) / lesson.lesson_reviews.length).toFixed(1)}
                              <span>({lesson.lesson_reviews.length})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Lesson Content */}
                    <div className="p-5">
                      <p className="text-gray-600 mb-5 leading-relaxed">
                        {lesson.description}
                      </p>
                      
                      {/* Video Preview */}
                      <div className="w-full h-96 rounded-lg overflow-hidden mb-5 bg-black">
                        <ReactPlayer
                          url={lesson.video_url}
                          controls={true}
                          width="100%"
                          height="100%"
                          className="rounded-lg"
                        />
                      </div>
                      
                      {/* Lesson Reviews Section */}
                      {lesson.lesson_reviews?.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">
                              Student Feedback
                            </h5>
                            <span className="text-sm text-gray-500">
                              {lesson.lesson_reviews.length} reviews
                            </span>
                          </div>
                          
                          <div className="space-y-4">
                            {lesson.lesson_reviews.slice(0, visibleReviews[lesson.lesson_id] || 3).map((review, idx) => (
                              <div 
                                key={idx} 
                                className="p-4 border border-gray-100 rounded-lg bg-gray-50"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
                                      {review.user_username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-gray-800">
                                      {review.user_username}
                                    </span>
                                  </div>
                                  <span className="text-yellow-400">
                                    {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                                  </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                  {review.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {lesson.lesson_reviews.length > (visibleReviews[lesson.lesson_id] || 3) && (
                            <button
                              onClick={() => handleLoadMoreReviews(lesson.lesson_id)}
                              className="mt-5 px-5 py-2 border border-blue-500 text-blue-600 rounded-lg font-medium flex items-center gap-2 mx-auto hover:bg-blue-50 transition-colors"
                            >
                              <span>Show More Reviews</span>
                              <span>↓</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About the Instructor
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-60 flex flex-col items-center gap-4">
                  <img 
                    src={instructor.profile_picture_url} 
                    alt={instructor.name} 
                    className="w-48 h-48 rounded-full object-cover border-4 border-gray-200"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 text-center">
                    {instructor.first_name} {instructor.last_name}
                  </h3>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Biography
                  </h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {instructor.bio || "No biography available."}
                  </p>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Teaching Style
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {instructor.teaching_style || "No information about teaching style."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "discussions" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Discussions
              </h2>
              
              {discussions.length > 0 ? (
                <div className="space-y-4">
                  {discussions.map((discussion, index) => (
                    <div 
                      key={index} 
                      className="p-6 border border-gray-100 rounded-xl bg-gray-50"
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {discussion.title}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
                          {discussion.user_username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 leading-tight">
                            Posted by <span className="font-semibold text-gray-700">{discussion.user_username}</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(discussion.discussion_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-gray-500 mb-4">
                    No discussions yet for this course.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enroll Section */}
        {!isEnrolled && (
          <div className="mt-12 text-center p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to start learning?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Enroll now to get full access to all course materials, including video lessons, downloadable resources, and community discussions.
            </p>
            <button
              onClick={handleEnroll}
              className="px-10 py-4 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Enroll Now
            </button>
          </div>
        )}
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