import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import UploadCourse from './pages/UploadCourse';
import TeacherDashboard from "./pages/TeacherDashboard";
import CoursePreview from "./pages/CoursePreview";
import LeaderboardPage from './pages/LeaderboardPage';
import LandingPage from './pages/LandingPage';
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/courses/:course_id" element={<CourseDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/upload-course" element={<UploadCourse />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/preview/:course_id" element={<CoursePreview />} />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default App;