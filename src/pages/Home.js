import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CourseCard from '../components/CourseCard';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const calculateDuration = (lessons) => {
    const totalSeconds = lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUserId(decoded.user_id);
        }

        const response = await fetch('http://127.0.0.1:5000/courses?include=enrollments');
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        let courses = await response.json();
        courses = courses.map(course => ({
          ...course,
          duration: calculateDuration(course.lessons),
          progress: course.enrollments?.find(e => e.user.user_id === currentUserId)?.progress || 0
        }));

        setAllCourses(courses);
        setFilteredCourses(courses);
      } catch (err) {
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  const handleSearch = (query) => {
    const filtered = allCourses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const enrolledCourses = allCourses.filter(course => 
    course.enrollments?.some(enrollment => enrollment.user.user_id === currentUserId)
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
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
        <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-center">
            <div className="text-red-500 mb-4 text-lg">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Our Courses</h1>
          <p className="mt-2 text-gray-600">Find the perfect course to advance your skills</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Enrolled Courses */}
        {currentUserId && enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <CourseCard 
                  key={course.id}
                  {...course}
                  isEnrolled={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Courses */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Available Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                {...course}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;