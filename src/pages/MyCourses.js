import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const MyCourses = () => {
  // Dummy enrolled courses data
  const [courses] = useState([
    {
      id: 1,
      title: "React Basics",
      description: "Learn the fundamentals of React.js.",
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      description: "Master JavaScript concepts like closures and async/await.",
    },
    {
      id: 3,
      title: "Python for Beginners",
      description: "A complete guide to Python programming.",
    },
  ]);

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-4">My Enrolled Courses</h2>

        {courses.length === 0 ? (
          <p>No courses enrolled yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white shadow-md rounded-lg p-4 border"
              >
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="text-gray-600">{course.description}</p>
                <Link
                  to={`/courses/${course.id}`}
                  className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  View Course
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyCourses;
