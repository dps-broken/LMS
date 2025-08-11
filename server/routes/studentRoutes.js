import express from 'express';
import { protect, student } from '../middleware/authMiddleware.js';

// Controller Imports
import { 
    getStudentProfile, updateStudentProfile, updateProfileImage, 
    markAttendance, getAttendanceSummary, getActiveAttendance 
} from '../controllers/studentController.js';
import {
    getStudentQuizzes, getQuizForStudentAttempt, submitQuiz, getQuizResultForStudent
} from '../controllers/quizController.js';
import { getStudentSchedule } from '../controllers/scheduleController.js';
import { getDocumentsForStudent, acceptOfferLetter } from '../controllers/documentController.js';
import { getActiveAssessmentsForStudent, submitAssessment } from '../controllers/assessmentController.js'; // New import

// Middleware Imports
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';
import { checkQuizTime, checkAttendanceWindow } from '../middleware/timeCheckMiddleware.js';

const router = express.Router();

// Profile Management
router.route('/profile').get(protect, student, getStudentProfile).put(protect, student, updateStudentProfile);
router.route('/profile/image').put(protect, student, uploadProfileImage, updateProfileImage);

// Quiz & Test Participation
router.get('/quizzes', protect, student, getStudentQuizzes);
router.get('/quizzes/:id', protect, student, checkQuizTime, getQuizForStudentAttempt);
router.post('/quizzes/:id/submit', protect, student, checkQuizTime, submitQuiz);
router.get('/quizzes/:id/result', protect, student, getQuizResultForStudent);

// Assessment Routes
router.get('/assessments', protect, student, getActiveAssessmentsForStudent);
router.post('/assessments/:id/submit', protect, student, submitAssessment);

// Attendance System
router.get('/attendance/summary', protect, student, getAttendanceSummary);
router.post('/attendance/:id/mark', protect, student, checkAttendanceWindow, markAttendance);
router.get('/attendance/active', protect, student, getActiveAttendance);

// Class Schedule
router.get('/schedule', protect, student, getStudentSchedule);

// Certificates & Offer Letters
router.get('/documents', protect, student, getDocumentsForStudent);
router.put('/documents/offer/:id/accept', protect, student, acceptOfferLetter);

export default router;