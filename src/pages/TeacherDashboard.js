import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { jwtDecode } from 'jwt-decode';
import CourseEditForm from '../components/CourseEditForm';
import AddLesson from '../components/AddLesson';
import DiscussionSection from '../components/DiscussionSection';
import EnrollmentChart from '../components/EnrollmentChart';

const TeacherDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ username: null });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollmentDetails] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editLessonData, setEditLessonData] = useState({
    lesson_id: '',
    title: '',
    description: '',
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
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseData, setEditCourseData] = useState({
    title: '',
    description: '',
    category: '',
    is_published: false,
    course_image: null
  });
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0
  });
  const [showEnrollmentChart, setShowEnrollmentChart] = useState(false);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);

  // Function to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  // Decode the token to get the user ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
        setUser({ username: decoded.username });
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
  const fetchCourses = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        headers: {
          ...getAuthHeader()
        }
      });
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

        // Calculate stats
        const totalCourses = data.courses.length;
        const totalStudents = data.courses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0);
        
        // Calculate average rating across all courses and lessons
        const allRatings = data.courses.flatMap(course => 
          course.lessons?.flatMap(lesson => 
            lesson.lesson_reviews?.map(review => review.rating) || []
          ) || []
        );
        
        const averageRating = allRatings.length > 0 
          ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
          : 0;

        setStats({
          totalCourses,
          totalStudents,
          averageRating
        });

        // Process enrollment history
        const enrollments = data.courses.flatMap(course => 
          course.enrollments?.map(enrollment => ({
            date: new Date(enrollment.enrollment_date),
            courseTitle: course.title
          })) || []
        ).sort((a, b) => a.date - b.date);

        // Group enrollments by day and calculate cumulative totals
        const dailyEnrollments = enrollments.reduce((acc, enrollment) => {
          const dayStr = enrollment.date.toLocaleDateString('default', { 
            day: 'numeric',
            month: 'short'
          });
          if (!acc[dayStr]) {
            acc[dayStr] = { new: 0, total: 0 };
          }
          acc[dayStr].new += 1;
          return acc;
        }, {});

        // Calculate cumulative totals
        let runningTotal = 0;
        Object.keys(dailyEnrollments).forEach(day => {
          runningTotal += dailyEnrollments[day].new;
          dailyEnrollments[day].total = runningTotal;
        });

        setEnrollmentHistory(Object.entries(dailyEnrollments).map(([day, data]) => ({
          day,
          new: data.new,
          total: data.total
        })));
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCourses();
    }
  }, [userId]);

  // Fetch enrollments from the server
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchEnrollments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/enrollments/${selectedCourse.course_id}`, {
          headers: {
            ...getAuthHeader()
          }
        });
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
        const response = await fetch(`http://localhost:5000/discussions?course_id=${selectedCourse.course_id}`, {
          headers: {
            ...getAuthHeader()
          }
        });
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
    fetch("http://localhost:5000/comments", {
      headers: {
        ...getAuthHeader()
      }
    })
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
          ...getAuthHeader()
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
      lesson_id: lesson.lesson_id,
      title: lesson.title,
      description: lesson.description,
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
      const formData = new FormData();
      formData.append('lesson_id', editLessonData.lesson_id);
      formData.append('title', editLessonData.title);
      formData.append('description', editLessonData.description);
  
      if (newVideo) {
        formData.append('file', newVideo);
      }
  
      const response = await fetch(
        `http://localhost:5000/lessons/${editLessonData.lesson_id}`,
        {
          method: 'PATCH',
          headers: {
            ...getAuthHeader()
          },
          body: formData
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
  
      const updatedLesson = await response.json();
  
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
    if (!editingLesson) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/lessons/${editingLesson.lesson_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ user_id: userId })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

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
      setEditingLesson(null);
      alert('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert(`Failed to delete lesson: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  

  const handlePostComment = async (discussionId) => {
    if (!newComment.content) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          ...newComment,
          discussion_id: discussionId,
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment({ discussion_id: null, content: '' });
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Please try again.');
    }
  };

  const formatProgress = (progress) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  );

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

  const handleEditCourse = (course) => {
    setEditCourseData({
      title: course.title,
      description: course.description,
      category: course.category,
      is_published: course.is_published,
      course_image: null
    });
    setIsEditingCourse(true);
  };

  const handleCourseDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCourseImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setEditCourseData(prev => ({
        ...prev,
        course_image: file,
        course_image_preview: previewUrl
      }));
    }
  };

  // Clean up preview URL when component unmounts or when modal closes
  useEffect(() => {
    return () => {
      if (editCourseData.course_image_preview) {
        URL.revokeObjectURL(editCourseData.course_image_preview);
      }
    };
  }, [editCourseData.course_image_preview]);

  const handleSaveCourse = async (updatedCourse) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', updatedCourse.title);
      formData.append('description', updatedCourse.description);
      formData.append('category', updatedCourse.category);
      formData.append('is_published', updatedCourse.is_published);

      if (updatedCourse.course_image) {
        formData.append('file', updatedCourse.course_image);
      }

      const response = await fetch(
        `http://localhost:5000/courses/${selectedCourse.course_id}`,
        {
          method: 'PATCH',
          headers: {
            ...getAuthHeader()
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update course');
      }

      const updatedCourseData = await response.json();
      const updatedCourses = courses.map(course =>
        course.course_id === selectedCourse.course_id ? updatedCourseData.course : course
      );

      setCourses(updatedCourses);
      setSelectedCourse(updatedCourseData.course);
      setIsEditingCourse(false);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert(`Failed to update course: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLessonSuccess = () => {
    setIsAddingLesson(false);
    // Refresh the courses data to show the new lesson
    if (userId) {
      fetchCourses();
    }
  };

  const handleAddLessonError = (error) => {
    console.error("Error adding lesson:", error);
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setIsDeletingCourse(true);
    try {
      const response = await fetch(
        `http://localhost:5000/courses/${selectedCourse.course_id}`,
        {
          method: 'DELETE',
          headers: {
            ...getAuthHeader()
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      const updatedCourses = courses.filter(course => course.course_id !== selectedCourse.course_id);
      setCourses(updatedCourses);
      setSelectedCourse(updatedCourses.length > 0 ? updatedCourses[0] : null);
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(`Failed to delete course: ${error.message}`);
    } finally {
      setIsDeletingCourse(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Teacher Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Manage your courses, track student progress, and engage with your learners
          </p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Courses</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowEnrollmentChart(!showEnrollmentChart)}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
                <p className="text-sm text-gray-500 mt-1">Click to view enrollment history</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.averageRating > 0 ? `${stats.averageRating} ★` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Chart */}
        {showEnrollmentChart && (
          <div className="mb-8">
            <EnrollmentChart enrollmentHistory={enrollmentHistory} />
          </div>
        )}

        {/* Course Selection */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-lg font-medium text-gray-700">Select Course:</label>
            {selectedCourse && (
              <div className="flex gap-3">
                <Link
                  to={`/preview/${selectedCourse.course_id}`}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Preview Course
                </Link>
                <button
                  onClick={() => handleEditCourse(selectedCourse)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Edit Course Details
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={isDeletingCourse}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isDeletingCourse ? 'Deleting...' : 'Delete Course'}
                </button>
              </div>
            )}
          </div>
          <select
            className="block w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
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

        {/* Course Edit Modal */}
        {isEditingCourse && (
          <CourseEditForm
            courseData={editCourseData}
            onClose={() => setIsEditingCourse(false)}
            onSave={handleSaveCourse}
            isSaving={isSaving}
            currentCourseImage={selectedCourse?.course_image_url}
          />
        )}

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
                                  {student.user.profile_picture_url ? (
                                    <img
                                      src={student.user.profile_picture_url}
                                      alt={student.user.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getInitialsColor(getInitials(student.user.name))}`}>
                                      <span className="text-sm font-medium">
                                        {getInitials(student.user.name)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.user.name}
                                    </div>
                                    <div className="text-sm text-gray-500">{student.user.email}</div>
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
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Course Lessons</h2>
                <button
                  onClick={() => setIsAddingLesson(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Add More Lessons
                </button>
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
                                      <img src={review.user_profile_picture_url} alt={review.user_username} className="h-10 w-10 rounded-full object-cover" />
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
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Course Discussions</h2>
            </div>
            <div className="p-6">
              <DiscussionSection 
                courseId={selectedCourse.course_id}
                userId={userId}
                userUsername={user?.username}
              />
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

        {/* Add Lesson Modal */}
        {isAddingLesson && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Lesson</h2>
                <button
                  onClick={() => setIsAddingLesson(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddLesson
                courseId={selectedCourse.course_id}
                onSuccess={handleAddLessonSuccess}
                onError={handleAddLessonError}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherDashboard;