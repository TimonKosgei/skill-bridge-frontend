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

  // Calculate course duration
  const calculateDuration = (lessons) => {
    const totalSeconds = lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user ID if logged in
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUserId(decoded.user_id);
        }

        // Fetch all courses with enrollments
        const response = await fetch('http://127.0.0.1:5000/courses?include=enrollments');
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        let courses = await response.json();
        
        // Add duration to each course
        courses = courses.map(course => ({
          ...course,
          duration: calculateDuration(course.lessons)
        }));

        setAllCourses(courses);
        setFilteredCourses(courses);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query) => {
    const filtered = allCourses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  // Get enrolled courses for current user
  const enrolledCourses = allCourses.filter(course => 
    course.enrollments?.some(enrollment => enrollment.user.user_id === currentUserId)
  );

  if (loading) return <div className="p-8 text-center">Loading courses...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-8">
        <SearchBar onSearch={handleSearch} />
        
        {/* Enrolled Courses Section */}
        {currentUserId && enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <CourseCard 
                  key={course.id}
                  {...course}
                  isEnrolled={true}
                  enrollmentDetails={course.enrollments.find(e => e.user.user_id === currentUserId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Courses Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                {...course}
                isEnrolled={currentUserId && course.enrollments?.some(e => e.user.user_id === currentUserId)}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;