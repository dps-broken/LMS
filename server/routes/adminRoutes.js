import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

// Controller Imports
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { createBatch, getBatches, updateBatch, deleteBatch } from '../controllers/batchController.js';
import { 
    getStudents, addStudent, editStudent, deleteStudent, 
    getDashboardStats, approveApplication, bulkUploadStudents, 
    sendNotification, getStudentDetailsById, getRecentActivities 
} from '../controllers/adminController.js';
import { 
    createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz, 
    publishQuizResults, getQuizSubmissions 
} from '../controllers/quizController.js';
import { createSchedule, getSchedules, updateSchedule, deleteSchedule, getAttendanceMonitoring } from '../controllers/scheduleController.js';
import { getAllPublicApplications, updatePublicApplicationStatus } from '../controllers/internshipController.js';
import { generateDocument, getAllDocuments } from '../controllers/documentController.js';
import { createAssessment, getAssessments, getSubmissionsForAssessment, deleteAssessment } from '../controllers/assessmentController.js';
import { createPosition, getPositions, updatePosition, deletePosition } from '../controllers/positionController.js';

// Middleware Imports
import { uploadCsv } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Dashboard
router.get('/dashboard-stats', protect, admin, getDashboardStats);
router.get('/activities', protect, admin, getRecentActivities);

// Department & Batch CRUD
router.route('/departments').post(protect, admin, createDepartment).get(protect, admin, getDepartments);
router.route('/departments/:id').put(protect, admin, updateDepartment).delete(protect, admin, deleteDepartment);
router.route('/batches').post(protect, admin, createBatch).get(protect, admin, getBatches);
router.route('/batches/:id').put(protect, admin, updateBatch).delete(protect, admin, deleteBatch);

// Student Management
router.route('/students').get(protect, admin, getStudents).post(protect, admin, addStudent);
router.route('/students/bulk').post(protect, admin, uploadCsv, bulkUploadStudents);
router.route('/students/:id').put(protect, admin, editStudent).delete(protect, admin, deleteStudent);
router.get('/students/:id/details', protect, admin, getStudentDetailsById);

// Public Application Management
router.get('/public-applications', protect, admin, getAllPublicApplications);
router.put('/public-applications/:id/status', protect, admin, updatePublicApplicationStatus);
router.put('/public-applications/:id/approve', protect, admin, approveApplication);

// Position/Opening Management
router.route('/positions').post(protect, admin, createPosition).get(protect, admin, getPositions);
router.route('/positions/:id').put(protect, admin, updatePosition).delete(protect, admin, deletePosition);

// Quiz Management
router.route('/quizzes').post(protect, admin, createQuiz).get(protect, admin, getQuizzes);
router.route('/quizzes/:id').get(protect, admin, getQuizById).put(protect, admin, updateQuiz).delete(protect, admin, deleteQuiz);
router.route('/quizzes/:id/publish').put(protect, admin, publishQuizResults);
router.route('/quizzes/:id/submissions').get(protect, admin, getQuizSubmissions);

// --- THIS IS THE FIX ---
// Assessment Management
router.route('/assessments')
    .post(protect, admin, createAssessment)
    .get(protect, admin, getAssessments);

// This route correctly matches the frontend's API call: GET /api/admin/assessments/:id/submissions
router.get('/assessments/:id/submissions', protect, admin, getSubmissionsForAssessment);

// This route handles deleting a specific assessment by its ID
router.delete('/assessments/:id', protect, admin, deleteAssessment);
// --------------------

// Class Scheduling & Attendance
router.route('/schedule').post(protect, admin, createSchedule).get(protect, admin, getSchedules);
router.route('/schedule/:id').put(protect, admin, updateSchedule).delete(protect, admin, deleteSchedule);
router.get('/attendance', protect, admin, getAttendanceMonitoring);

// Document Management
router.route('/documents').get(protect, admin, getAllDocuments);
router.route('/documents/generate').post(protect, admin, generateDocument);

// Notification System
router.post('/notifications', protect, admin, sendNotification);

export default router;