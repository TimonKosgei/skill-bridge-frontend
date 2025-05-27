import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage = () => {
  const [topCourses, setTopCourses] = useState([]);
  const [reviews, setReviews] = useState([]); // State for reviews
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/public/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();

        // Calculate enrollments as the length of the enrollments array and sort courses
        const sortedCourses = data
          .map((course) => ({
            ...course,
            enrollmentCount: course.enrollments ? course.enrollments.length : 0,
          }))
          .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
          .slice(0, 3);
        setTopCourses(sortedCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/public/lessonreviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchCourses();
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <img 
                    src="https://skillbridge28.s3.eu-north-1.amazonaws.com/photo_2025-05-02_19-59-20.jpg" 
                    alt="SkillBridge Logo"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900">SkillBridge</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Master New Skills with Interactive Learning
          </h1>
          <p className="mt-4 max-w-lg mx-auto text-lg text-gray-500">
            SkillBridge connects you with expert-led courses, hands-on projects, and a community of learners.
          </p>
          <div className="mt-6">
            <Link
              to="/signup"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Learning Free
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
              A better way to learn
            </p>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Expert Instructors</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Learn from industry professionals with real-world experience.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Earn Badges</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete courses and projects to earn verifiable credentials.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Community Learning</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Join discussions, share projects, and get feedback from peers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses Section */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Top Courses</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-blue-100 flex items-center justify-center">
                    <img
                      className="h-full w-full object-cover"
                      src={course.course_image_url || 'https://via.placeholder.com/150'}
                      alt={course.title || 'Course Image'}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {course.enrollmentCount} Enrollments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">What Our Learners Say</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {reviews.length > 0 ? (
              reviews.slice(0, 2).map((review, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={review.user_profile_picture_url}
                      alt={review.user_username}
                    />
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">{review.user_username}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No reviews available.</p>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-white">
            Ready to start your learning journey?
          </h2>
          <p className="mt-2 text-base text-blue-200">
            Join thousands of learners who are advancing their careers with SkillBridge.
          </p>
          <Link
            to="/signup"
            className="mt-4 inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-400">© 2025 Skill-bridge. All rights reserved.</p>          
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
