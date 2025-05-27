import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { jwtDecode } from 'jwt-decode';
import { getAuthHeader } from '../utils/authUtils';

const Home = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const categories = [
    'Academic subjects',
    'Technical and vocational skills',
    'Professional and career skills',
    'Creative and artistic skill',
    'Digital skills and Tech',
    'Languages',
    'Entrepreneurship',
    'Soft skills'
  ];

  const calculateDuration = (lessons) => {
    const totalSeconds = lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const scrollToCategory = (category) => {
    const element = document.getElementById(category.replace(/\s+/g, '-').toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUserId(decoded.user_id);
        }

        const response = await fetch('http://127.0.0.1:5000/courses?include=enrollments', {
          headers: {
            ...getAuthHeader()
          }
        });
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
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Explore Our Courses</h1>
          
          <p className="mt-2 text-sm text-gray-600">Find the perfect course to advance your skills</p>
        </div>
        <SearchBar onSearch={handleSearch} />
        {/* Category Navigation */}
        <div className="mb-1 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {categories.map(category => {
              const categoryCourses = filteredCourses.filter(course => course.category === category);
              if (categoryCourses.length === 0) return null;
              
              return (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  className="px-4 py-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors duration-200"
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enrolled Courses */}
        {currentUserId && enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Categories */}
        {categories.map(category => {
          const categoryCourses = filteredCourses.filter(course => course.category === category);
          if (categoryCourses.length === 0) return null;
          
          return (
            <section 
              key={category} 
              id={category.replace(/\s+/g, '-').toLowerCase()}
              className="mb-12 scroll-mt-20"
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-800">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    {...course}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;