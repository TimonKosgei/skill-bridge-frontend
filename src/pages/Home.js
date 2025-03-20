import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/courses')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Http error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setFilteredCourses(data); // Initialize filteredCourses with all data
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (query) => {
    const filtered = data.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCourses(filtered);
  };
  //error handling
  console.log(loading)
  console.log(error)

  return (
    <>
      <Header />
      <div className="hero bg-blue-500 text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Skill Bridge</h1>
        <p className="text-xl">Learn new skills and advance your career with our top courses.</p>
      </div>
      <div className="container mx-auto p-8">
        <SearchBar onSearch={handleSearch} />
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Picks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
