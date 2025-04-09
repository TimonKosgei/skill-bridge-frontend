import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const TeacherDashboard = () => {
  const user_id = 1;
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollmentDetails] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [newVideo, setNewVideo] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses with lessons and reviews from the server
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/users/${user_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user_id]);

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
          user_id: user_id
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
  };

  const handleVideoChange = (e) => {
    setNewVideo(e.target.files[0]);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson || !newVideo) {
      alert('Please select a lesson and upload a new video.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', newVideo);
      formData.append('lesson_id', editingLesson.lesson_id);

      const response = await fetch(
        `http://localhost:5000/lessons/${editingLesson.lesson_id}/video`, 
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update lesson video');
      }

      // Update the lesson in the selected course
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
      
      alert('Video updated successfully!');
      setEditingLesson(null);
      setNewVideo(null);
    } catch (error) {
      console.error('Error updating lesson video:', error);
      alert('Failed to update video. Please try again.');
    }
  };

  const formatProgress = (progress) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  );

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (courses.length === 0) return <div className="p-4">No courses available</div>;

  return (
    <>
      <Header />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Course:</label>
          <select
            className="p-2 border rounded w-full md:w-1/3"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Students Progress Section */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Enrollment Date</th>
                        <th className="text-left p-3">Progress</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((student) => (
                        <tr key={student.enrollment_id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {student.user?.first_name} {student.user?.last_name}
                          </td>
                          <td className="p-3">
                            {new Date(student.enrollment_date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {formatProgress(student.progress)}
                            <span className="ml-2">{student.progress}%</span>
                          </td>
                          <td className="p-3">
                            {student.is_completed ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Completed
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lessons Section with Reviews */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold mb-4">Lessons</h2>
              <div className="space-y-6">
                {selectedCourse.lessons?.length > 0 ? (
                  selectedCourse.lessons.map((lesson) => (
                    <div key={lesson.lesson_id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{lesson.title}</h3>
                          <p className="text-gray-600 text-sm">{lesson.description}</p>
                          <p className="text-blue-500 text-sm mt-2">
                            <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                              View Video
                            </a>
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Edit Video
                        </button>
                      </div>

                      {/* Reviews for this lesson */}
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Student Reviews</h4>
                        {lesson.lesson_reviews?.length > 0 ? (
                          <div className="space-y-3">
                            {lesson.lesson_reviews.map((review) => (
                              <div key={review.review_id} className="border-l-4 border-blue-200 pl-3 py-1">
                                <div className="flex items-center mb-1">
                                  <span className="font-medium">{review.user_username}</span>
                                  <div className="ml-2 text-yellow-500">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm">{review.comment}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {new Date(review.review_date).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No reviews for this lesson yet</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No lessons available for this course</p>
                )}
              </div>
            </div>

            {/* Edit Lesson Section */}
            {editingLesson && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4">Edit Lesson</h2>
                  <h3 className="font-medium mb-2">{editingLesson.title}</h3>
                  <label className="block mb-2">
                    <span className="text-gray-700">Upload New Video</span>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoChange} 
                      className="mt-1 p-2 w-full border rounded" 
                    />
                  </label>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveLesson}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Discussions Section */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold mb-4">Course Discussions</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="space-y-4">
                  {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                      <div key={discussion.discussion_id} className="border-b pb-4">
                        <h3 className="font-medium">{discussion.title}</h3>
                        <p className="text-gray-600 text-sm">{discussion.content}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Posted by {discussion.user_username} on{' '}
                          {new Date(discussion.discussion_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No discussions yet</p>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Start New Discussion</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full p-2 border rounded mb-2"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Content"
                    className="w-full p-2 border rounded mb-2"
                    rows={3}
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  />
                  <button
                    onClick={handleStartDiscussion}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Post Discussion
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