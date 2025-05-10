import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import AuthRoute from './components/AuthRoute';
import { useAuth } from './hooks/useAuth';

// Component to handle public routes (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInstructor } = useAuth();
  
  if (isAuthenticated()) {
    return <Navigate to={isInstructor() ? '/teacher-dashboard' : '/home'} />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes - Learner Only */}
        <Route path="/home" element={
          <AuthRoute allowedRoles={['Learner']}>
            <Home />
          </AuthRoute>
        } />
        <Route path="/profile" element={
          <AuthRoute allowedRoles={['Learner', 'Instructor']}>
            <Profile />
          </AuthRoute>
        } />
        <Route path="/courses/:course_id" element={
          <AuthRoute allowedRoles={['Learner']}>
            <CourseDetail />
          </AuthRoute>
        } />
        <Route path="/leaderboard" element={
          <AuthRoute allowedRoles={['Learner']}>
            <LeaderboardPage />
          </AuthRoute>
        } />
        <Route path="/preview/:course_id" element={
          <AuthRoute allowedRoles={['Learner','Instructor']}>
            <CoursePreview />
          </AuthRoute>
        } />

        {/* Protected Routes - Instructor Only */}
        <Route path="/teacher-dashboard" element={
          <AuthRoute allowedRoles={['Instructor']}>
            <TeacherDashboard />
          </AuthRoute>
        } />
        <Route path="/upload-course" element={
          <AuthRoute allowedRoles={['Instructor']}>
            <UploadCourse />
          </AuthRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;