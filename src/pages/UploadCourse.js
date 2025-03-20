import React from 'react';
import CourseForm from '../components/CourseForm';
import Header from '../components/Header';



const UploadCourse = () => {
  return (
    <>
        <Header />
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Upload Course</h1>
        <CourseForm />
        </div>
    </>
  );
};

export default UploadCourse;
