import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import LessonCard from '../components/LessonCard';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/courses/${id}`);
        if (!response.ok) {
          throw new Error(`Http error! Status: ${response.status}`);
        }
        const result = await response.json();
        setCourse(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const lessons = course.lessons || [];

  const progress = (8 / 24) * 100;

  return (
    <>
      <Header />
      <div className="container mx-auto p-8">
        <div className="bg-white p-6 rounded shadow-md">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex flex-col lg:flex-row">
            <img src={course.course_image_url} alt={course.title} className="w-32 h-32 rounded-full mb-4 lg:mb-0 lg:mr-4" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-700 mb-4">{course.description}</p>
              <p className="text-gray-700 mb-2"><strong>Category:</strong> {course.category}</p>
              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2">Instructor</h2>
                <p className="text-gray-700 mb-2"><strong>Bio:</strong></p>
                <p className="text-gray-700">{course.instructor?.bio}</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Lessons</h2>
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;
