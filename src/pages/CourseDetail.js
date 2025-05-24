import { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CompletionCelebration from '../components/CompletionCelebration';
import DiscussionSection from '../components/DiscussionSection';
import { getAuthHeader } from '../utils/authUtils';

const CourseDetail = () => {
  const video = useRef(null);
  const { course_id } = useParams();

  // User authentication and data
  const [user, setUser] = useState({ user_id: null, username: null });
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
  }, []);

  // Course data
  const [course, setCourse] = useState({});
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [instructor, setInstructor] = useState({});
  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [comments, setComments] = useState([]);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState('lesson');
  const [newReview, setNewReview] = useState({ comment: "", rating: 0 });
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState({ discussion_id: null, content: "" });

  // Helper functions
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgress = (progress) => {
    const { playedSeconds } = progress;
    fetch("http://localhost:5000/progress", {
      method: "PATCH",
      headers: { 
        ...getAuthHeader(),
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        user_id: user.user_id,
        lesson_id: currentLesson.lesson_id,
        watched_duration: playedSeconds,
      }),
    }).catch((error) => console.error("Error updating progress:", error));
  };

  // Helper function to generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get background color based on initials
  const getInitialsColor = (initials) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Data fetching
  useEffect(() => {
    // Fetch course data
    fetch(`http://127.0.0.1:5000/courses/${course_id}`, {
      headers: getAuthHeader()
    })
      .then(response => response.json())
      .then(data => {
        setCourse(data);
        setLessons(data.lessons);
        setInstructor(data.instructor);
      })
      .catch(error => console.error("Error fetching course data:", error));

    // Fetch discussions
    fetch(`http://localhost:5000/discussions?course_id=${course_id}`, {
      headers: getAuthHeader()
    })
      .then(response => response.json())
      .then(data => setDiscussions(data))
      .catch(error => console.error("Error fetching discussions:", error));

    // Fetch comments
    fetch("http://localhost:5000/comments", {
      headers: getAuthHeader()
    })
      .then(response => response.json())
      .then(data => setComments(data))
      .catch(error => console.error("Error fetching comments:", error));
  }, [course_id]);

  useEffect(() => {
    if (currentLesson) {
      fetch(`http://localhost:5000/lessons/${currentLesson.lesson_id}`, {
        headers: getAuthHeader()
      })
        .then(response => response.json())
        .then(data => setReviews(data.lesson_reviews))
        .catch(error => console.error("Fetch error:", error));
    }
  }, [currentLesson]);

  useEffect(() => {
    if (lessons.length > 0) {
      setCurrentLesson(lessons[0]);
    }
  }, [lessons]);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const decodedToken = jwtDecode(token);
        const response = await fetch(`http://127.0.0.1:5000/users/${decodedToken.user_id}`, {
          headers: getAuthHeader()
        });
        
        if (response.ok) {
          const userData = await response.json();
          const enrollment = userData.enrollments.find(e => parseInt(e.course.course_id) === parseInt(course_id));
          if (enrollment) {
            setEnrollmentDetails(enrollment);
            // Show celebration if progress is 100 and show_celebration is false
            if (enrollment.progress === 100 && !enrollment.show_celebration) {
              setShowCelebration(true);
              // Update the show_celebration flag in the backend
              try {
                const updateResponse = await fetch(`http://127.0.0.1:5000/enrollments`, {
                  method: "PATCH",
                  headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({ 
                    enrollment_id: enrollment.enrollment_id,
                    show_celebration: true
                  }),
                });
                
                if (!updateResponse.ok) {
                  console.error('Failed to update celebration status');
                }
              } catch (error) {
                console.error('Error updating celebration status:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
      }
    };

    fetchEnrollmentStatus();
    const intervalId = setInterval(fetchEnrollmentStatus, 5000);
    return () => clearInterval(intervalId);
  }, [course_id]);

  // Event handlers
  const handleDeleteReview = async (reviewId) => {
    try {
      await fetch("http://localhost:5000/lessonreviews", {
        method: "DELETE",
        headers: { 
          ...getAuthHeader(),
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ review_id: reviewId }),
      });
      setReviews(reviews.filter(review => review.review_id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Progress</h3>
            
            {enrollmentDetails && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${enrollmentDetails.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{enrollmentDetails.progress}% Complete</span>
                </div>
              </div>
            )}

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h3>
            <ol className="space-y-2">
              {lessons.map((lesson, index) => (
                <li
                  key={lesson.lesson_id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentLesson?.lesson_id === lesson.lesson_id 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'hover:bg-gray-100 hover:border hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate font-medium">
                      {index + 1}. {lesson.title}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {formatDuration(lesson.duration)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ReactPlayer 
                ref={video}
                onProgress={handleProgress}
                url={currentLesson?.video_url}  
                width="100%"
                height="450px"
                controls
                className="react-player"
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mt-6">
              {['lesson', 'teacher', 'reviews', 'discussions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab === "lesson" ? "📖 Lesson" : 
                   tab === "teacher" ? "👨‍🏫 Instructor" : 
                   tab === "reviews" ? "⭐ Reviews" : "💬 Discussions"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              {activeTab === "lesson" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLesson?.title || "Loading..."}
                  </h2>
                  <p className="text-gray-600">
                    {currentLesson?.description || "Loading..."}
                  </p>
                </div>
              )}

              {activeTab === "teacher" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    {instructor.profile_picture_url ? (
                      <img
                        src={instructor.profile_picture_url}
                        alt={`${instructor.first_name} ${instructor.last_name}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white border-2 border-gray-200 ${getInitialsColor(getInitials(`${instructor.first_name} ${instructor.last_name}`))}`}>
                        <span className="text-xl font-medium">
                          {getInitials(`${instructor.first_name} ${instructor.last_name}`)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {instructor.first_name} {instructor.last_name}
                      </h3>
                      <p className="text-gray-600">{instructor.bio || 'No bio available'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Reviews</h3>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.review_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {review.user_username?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-lg font-medium text-gray-900">{review.user_username}</h4>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.review_date).toLocaleDateString()}
                                  </span>
                                  {review.user_id === user.user_id && (
                                    <button
                                      onClick={() => handleDeleteReview(review.review_id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="mt-2 text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet.</p>
                  )}

                  {/* New Review Form */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Write a Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="text-2xl focus:outline-none"
                            >
                              <span className={newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                        <textarea
                          placeholder="Share your thoughts about this lesson..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (newReview.comment && newReview.rating) {
                            try {
                              const response = await fetch("http://localhost:5000/lessonreviews", {
                                method: "POST",
                                headers: { 
                                  ...getAuthHeader(),
                                  "Content-Type": "application/json" 
                                },
                                body: JSON.stringify({
                                  user_id: user.user_id,
                                  lesson_id: currentLesson.lesson_id,
                                  rating: newReview.rating,
                                  comment: newReview.comment,
                                }),
                              });

                              if (!response.ok) throw new Error('Failed to submit review');
                              
                              const savedReview = await response.json();
                              setReviews([...reviews, savedReview]);
                              setNewReview({ comment: "", rating: 0 });
                            } catch (error) {
                              console.error("Error submitting review:", error);
                              alert("Failed to submit review. Please try again.");
                            }
                          } else {
                            alert("Please fill out all fields and select a rating.");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "discussions" && (
                <DiscussionSection 
                  courseId={course_id}
                  userId={user.user_id}
                  userUsername={user.username}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CompletionCelebration 
        show={showCelebration} 
        onClose={() => setShowCelebration(false)}
        courseTitle={course.title}
        name={user.username}
      />
    </>
  );
};

export default CourseDetail;