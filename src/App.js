import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import UploadCourse from './pages/UploadCourse';
import FileUpload from './pages/test';
import MyCourses from './pages/MyCourses'; // Import MyCourses page
import CoursePreview from './pages/CoursePreview';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/courses/:course_id" element={<CourseDetail />} /> {/* Dynamic route for CourseDetail */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload-course" element={<UploadCourse />} />
        <Route path="/file-upload" element={<FileUpload />} />
        <Route path="/course-preview" element={<CoursePreview />} />
        <Route path="/my-courses" element={<MyCourses />} /> {/* Add route for MyCourses */}
      </Routes>
    </Router>
  );
};

export default App;