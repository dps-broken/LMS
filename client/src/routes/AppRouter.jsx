import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Common
import Layout from '../components/common/Layout.jsx';
import NotFound from '../components/common/NotFound.jsx';
import PrivateRoute from '../components/common/PrivateRoute.jsx';

// Public Pages
import Login from '../pages/public/Login.jsx';
import OTPVerification from '../pages/public/OTPVerification.jsx';
import ForgotPassword from '../pages/public/ForgotPassword.jsx';
import ApplyInternship from '../pages/public/ApplyInternship.jsx';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageStudents from '../pages/admin/ManageStudents.jsx';
import ManageDepartments from '../pages/admin/ManageDepartments.jsx';
import ManageBatches from '../pages/admin/ManageBatches.jsx';
import ManageQuizzes from '../pages/admin/ManageQuizzes.jsx';
import ManageSchedule from '../pages/admin/ManageSchedule.jsx';
import ManageAttendance from '../pages/admin/ManageAttendance.jsx';
import ManageDocuments from '../pages/admin/ManageDocuments.jsx';
import ManagePublicApps from '../pages/admin/ManagePublicApps.jsx';
import ManageAssessments from '../pages/admin/ManageAssessments.jsx';
import ManageOpenings from '../pages/admin/ManageOpenings.jsx'; // New admin page
import ManageNotifications from '../pages/admin/ManageNotifications.jsx';
import IssuanceLog from '../pages/admin/IssuanceLog.jsx';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard.jsx';
import StudentProfile from '../pages/student/StudentProfile.jsx';
import StudentQuiz from '../pages/student/StudentQuiz.jsx';
import AttemptQuiz from '../pages/student/AttemptQuiz.jsx';
import QuizResult from '../pages/student/QuizResult.jsx';
import StudentAssessments from '../pages/student/StudentAssessments.jsx';
import StudentSchedule from '../pages/student/StudentSchedule.jsx';
import StudentAttendance from '../pages/student/StudentAttendance.jsx';
import StudentDocuments from '../pages/student/StudentDocuments.jsx';

const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/apply-internship" element={<ApplyInternship />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Routes */}
            <Route element={<PrivateRoute allowedRoles={['student']} />}>
                <Route path="/" element={<Layout />}>
                    <Route index element={<StudentDashboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="quizzes" element={<StudentQuiz />} />
                    <Route path="quizzes/attempt/:id" element={<AttemptQuiz />} />
                    <Route path="quizzes/result/:id" element={<QuizResult />} />
                    <Route path="assessments" element={<StudentAssessments />} />
                    <Route path="schedule" element={<StudentSchedule />} />
                    <Route path="attendance" element={<StudentAttendance />} />
                    <Route path="documents" element={<StudentDocuments />} />
                </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                 <Route path="/admin" element={<Layout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="students" element={<ManageStudents />} />
                    <Route path="applications" element={<ManagePublicApps />} />
                    <Route path="openings" element={<ManageOpenings />} />
                    <Route path="departments" element={<ManageDepartments />} />
                    <Route path="batches" element={<ManageBatches />} />
                    <Route path="quizzes" element={<ManageQuizzes />} />
                    <Route path="assessments" element={<ManageAssessments />} />
                    <Route path="schedule" element={<ManageSchedule />} />
                    <Route path="attendance" element={<ManageAttendance />} />
                    <Route path="documents" element={<ManageDocuments />} />
                    <Route path="issuance-log" element={<IssuanceLog />} />
                    <Route path="notifications" element={<ManageNotifications />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;