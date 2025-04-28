import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { jwtDecode } from 'jwt-decode';

const TeacherDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollmentDetails] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editLessonData, setEditLessonData] = useState({
    title: '',
    description: '',
    duration: '',
    video_url: ''
  });
  const [newVideo, setNewVideo] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ discussion_id: null, content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Decode the token to get the user ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Invalid token. Please log in again.');
        setLoading(false);
      }
    } else {
      setError('No token found. Please log in.');
      setLoading(false);
    }
  }, []);

  // Fetch courses with lessons and reviews from the server
  useEffect(() => {
    if (!userId) return;

    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        
        if (!data.courses || data.courses.length === 0) {
          setCourses([]);
          setSelectedCourse(null);
        } else {
          setCourses(data.courses);
          setSelectedCourse(data.courses[0]);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Fetch enrollments from the server
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchEnrollments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/enrollments/${selectedCourse.course_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch enrollments');
        }
        const data = await response.json();
        setEnrollmentDetails(data);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError(err.message);
      }
    };

    fetchEnrollments();
  }, [selectedCourse]);
  
  // Fetch discussions from the server
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/discussions?course_id=${selectedCourse.course_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch discussions');
        }
        const data = await response.json();
        setDiscussions(data);
      } catch (err) {
        console.error('Error fetching discussions:', err);
        setError(err.message);
      }
    };

    fetchDiscussions();
  }, [selectedCourse]);

  // Fetch comments from the server
  useEffect(() => {
    fetch("http://localhost:5000/comments")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setComments(data);
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, []);

  const handleStartDiscussion = async () => {
    if (!newDiscussion.title || !newDiscussion.content) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDiscussion,
          course_id: selectedCourse.course_id,
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create discussion');
      }

      const newDiscussionData = await response.json();
      setDiscussions([...discussions, newDiscussionData]);
      setNewDiscussion({ title: '', content: '' });
    } catch (err) {
      console.error('Error creating discussion:', err);
      alert('Failed to create discussion. Please try again.');
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setEditLessonData({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      video_url: lesson.video_url
    });
    setNewVideo(null);
  };

  const handleVideoChange = (e) => {
    setNewVideo(e.target.files[0]);
  };

  const handleLessonDataChange = (e) => {
    const { name, value } = e.target;
    setEditLessonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    setIsSaving(true);

    try {
      // First update lesson metadata if changed
      const metadataResponse = await fetch(
        `http://localhost:5000/lessons/${editingLesson.lesson_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editLessonData),
        }
      );

      if (!metadataResponse.ok) {
        throw new Error('Failed to update lesson metadata');
      }

      // Then update video if a new one was selected
      let updatedLesson = await metadataResponse.json();
      
      if (newVideo) {
        const formData = new FormData();
        formData.append('video', newVideo);

        const videoResponse = await fetch(
          `http://localhost:5000/lessons/${editingLesson.lesson_id}/video`, 
          {
            method: 'PUT',
            body: formData,
          }
        );

        if (!videoResponse.ok) {
          throw new Error('Failed to update lesson video');
        }
        updatedLesson = await videoResponse.json();
      }

      // Update local state
      const updatedCourses = courses.map(course => {
        if (course.course_id === selectedCourse.course_id) {
          const updatedLessons = course.lessons.map(lesson => 
            lesson.lesson_id === updatedLesson.lesson_id ? updatedLesson : lesson
          );
          return { ...course, lessons: updatedLessons };
        }
        return course;
      });

      setCourses(updatedCourses);
      setSelectedCourse(updatedCourses.find(c => c.course_id === selectedCourse.course_id));
      
      alert('Lesson updated successfully!');
      setEditingLesson(null);
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert(`Failed to update lesson: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!editingLesson || !window.confirm('Are you sure you want to delete this lesson? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/lessons/${editingLesson.lesson_id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      // Update local state
      const updatedCourses = courses.map(course => {
        if (course.course_id === selectedCourse.course_id) {
          const updatedLessons = course.lessons.filter(
            lesson => lesson.lesson_id !== editingLesson.lesson_id
          );
          return { ...course, lessons: updatedLessons };
        }
        return course;
      });

      setCourses(updatedCourses);
      setSelectedCourse(updatedCourses.find(c => c.course_id === selectedCourse.course_id));
      
      alert('Lesson deleted successfully!');
      setEditingLesson(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostComment = async (discussionId) => {
    if (!newComment.content || !discussionId) {
      alert("Please write a comment before posting.");
      return;
    }
  
    const commentData = {
      user_id: userId,
      discussion_id: discussionId,
      content: newComment.content,
      comment_date: new Date().toISOString(),
    };
  
    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment({ discussion_id: null, content: '' });
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const formatProgress = (progress) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  );
  
    if (loading) {
      return (
        <>
          <Header />
          <div className="min-h-screen bg-gray-50 p-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Teacher Dashboard</h1>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </>
      );
    }
  
    if (error) {
      return (
        <>
          <Header />
          <div className="min-h-screen bg-gray-50 p-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Teacher Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-center">
              <div className="text-red-500 mb-4 text-lg">{error}</div>
              {error.includes('token') ? (
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Login
                </Link>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        </>
      );
    }
  
    if (!courses || courses.length === 0) {
      return (
        <>
          <Header />
          <div className="min-h-screen bg-gray-50 p-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Teacher Dashboard</h1>
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
              <div className="text-gray-600 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h2 className="text-2xl font-semibold mt-4 text-gray-900">No Courses Found</h2>
                <p className="mt-2 text-gray-600">You haven't created any courses yet.</p>
              </div>
              <Link
                to="/upload-course"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Course
              </Link>
            </div>
          </div>
        </>
      );
    }
  
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              Teacher Dashboard
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Manage your courses, track student progress, and engage with your learners
            </p>
          </div>
  
          {/* Course Selection */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <label className="block text-lg font-medium text-gray-700 mb-3">Select Course:</label>
            <select
              className="block w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
              value={selectedCourse?.course_id || ''}
              onChange={(e) => {
                const courseId = Number(e.target.value);
                const course = courses.find(c => c.course_id === courseId);
                setSelectedCourse(course);
              }}
            >
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
  
          {selectedCourse && (
            <div className="space-y-8">
              {/* Students Progress Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900">Enrolled Students</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days to Complete</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrollments.length > 0 ? (
                          enrollments.map((student) => {
                            const enrollmentDate = new Date(student.enrollment_date);
                            const completionDate = student.completed_date ? new Date(student.completed_date) : null;
                            const daysToComplete = completionDate
                              ? Math.ceil((completionDate - enrollmentDate) / (1000 * 60 * 60 * 24))
                              : null;
  
                            return (
                              <tr key={student.enrollment_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-medium">
                                        {student.user?.first_name?.charAt(0)}{student.user?.last_name?.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {student.user?.first_name} {student.user?.last_name}
                                      </div>
                                      <div className="text-sm text-gray-500">{student.user?.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{enrollmentDate.toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {formatProgress(student.progress)}
                                    <span className="ml-2 text-sm font-medium text-gray-700">{student.progress}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {completionDate ? completionDate.toLocaleDateString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {daysToComplete ? `${daysToComplete} days` : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {student.is_completed ? (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                      In Progress
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No students enrolled in this course yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
  
              {/* Lessons Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900">Course Lessons</h2>
                </div>
                <div className="p-6 space-y-6">
                  {selectedCourse.lessons?.length > 0 ? (
                    selectedCourse.lessons.map((lesson) => (
                      <div key={lesson.lesson_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-semibold text-gray-900">{lesson.title}</h3>
                              <button
                                onClick={() => handleEditLesson(lesson)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                              >
                                Edit Lesson
                              </button>
                            </div>
                            <p className="mt-2 text-gray-600">{lesson.description}</p>
                            <div className="mt-4 flex items-center space-x-4">
                              <a 
                                href={lesson.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                                Watch Video
                              </a>
                              <span className="text-gray-500">
                                {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                              </span>
                            </div>
                          </div>
                        </div>
  
                        {/* Reviews Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Student Reviews</h4>
                          {lesson.lesson_reviews?.length > 0 ? (
                            <div className="space-y-4">
                              {lesson.lesson_reviews.map((review) => (
                                <div key={review.review_id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-medium">
                                          {review.user_username?.charAt(0)}
                                        </span>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{review.user_username}</p>
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <svg
                                              key={i}
                                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.review_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-gray-600">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <h3 className="mt-2 text-lg font-medium text-gray-900">No Reviews Yet</h3>
                              <p className="mt-1 text-gray-500">Student reviews will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-4 text-xl font-medium text-gray-900">No Lessons Added</h3>
                      <p className="mt-2 text-gray-600">Add lessons to your course to get started</p>
                      <div className="mt-6">
                        <Link
                          to={`/courses/${selectedCourse.course_id}/add-lesson`}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Add First Lesson
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Discussions Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900">Course Discussions</h2>
                </div>
                <div className="p-6">
                  {/* Existing Discussions */}
                  <div className="space-y-6">
                    {discussions.length > 0 ? (
                      discussions.map((discussion) => (
                        <div key={discussion.discussion_id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {discussion.user_username?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">{discussion.title}</h3>
                                <span className="text-sm text-gray-500">
                                  {new Date(discussion.discussion_date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-600">{discussion.content}</p>
                              
                              {/* Comments */}
                              <div className="mt-4 space-y-4">
                                {comments
                                  .filter((comment) => comment.discussion_id === discussion.discussion_id)
                                  .map((comment) => (
                                    <div key={comment.comment_id} className="bg-gray-50 p-4 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-sm font-medium">
                                              {comment.user_username?.charAt(0)}
                                            </span>
                                          </div>
                                          <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{comment.user_username}</p>
                                          </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {new Date(comment.comment_date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-sm text-gray-600">{comment.content}</p>
                                    </div>
                                  ))}
                              </div>
  
                              {/* Add Comment */}
                              <div className="mt-4">
                                <textarea
                                  placeholder="Write a comment..."
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                  value={newComment.discussion_id === discussion.discussion_id ? newComment.content : ''}
                                  onChange={(e) =>
                                    setNewComment({ discussion_id: discussion.discussion_id, content: e.target.value })
                                  }
                                />
                                <button
                                  onClick={() => handlePostComment(discussion.discussion_id)}
                                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                  Post Comment
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <h3 className="mt-4 text-xl font-medium text-gray-900">No Discussions Yet</h3>
                        <p className="mt-2 text-gray-600">Start a discussion to engage with your students</p>
                      </div>
                    )}
                  </div>
  
                  {/* Start New Discussion */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Discussion</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="Discussion title"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newDiscussion.title}
                          onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                          placeholder="What would you like to discuss?"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          value={newDiscussion.content}
                          onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={handleStartDiscussion}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Post Discussion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {/* Edit Lesson Modal */}
          {editingLesson && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Lesson</h2>
                  <button
                    onClick={() => setEditingLesson(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={editLessonData.title}
                        onChange={handleLessonDataChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)*</label>
                      <input
                        type="number"
                        name="duration"
                        value={editLessonData.duration}
                        onChange={handleLessonDataChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                    <textarea
                      name="description"
                      value={editLessonData.description}
                      onChange={handleLessonDataChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Video</label>
                    <div className="flex items-center space-x-4">
                      <a 
                        href={editLessonData.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        View Current Video
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Video (optional)</label>
                    <div className="mt-1 flex items-center">
                      <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                        <span className="font-medium">Choose File</span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleVideoChange} 
                          className="hidden"
                        />
                      </label>
                      <span className="ml-2 text-sm text-gray-500">
                        {newVideo ? newVideo.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">MP4, WebM up to 100MB</p>
                  </div>
                </div>
  
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleDeleteLesson}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    disabled={isSaving || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Lesson'}
                  </button>
                  
                  <div className="space-x-4">
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                      disabled={isSaving || isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveLesson}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      disabled={isSaving || isDeleting}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };
  
  export default TeacherDashboard;