import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { Readable } from 'stream';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Import local models
import User from '../models/User.js';
import Department from '../models/Department.js';
import Batch from '../models/Batch.js';
import Quiz from '../models/Quiz.js';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';
import PublicApplication from '../models/PublicApplication.js';
import QuizResult from '../models/QuizResult.js';
import InternshipApplication from '../models/InternshipApplication.js';
import ActivityLog from '../models/ActivityLog.js';
import AssessmentSubmission from '../models/AssessmentSubmission.js';
import Document from '../models/Document.js';

// Import services
import { sendWelcomeEmail, sendNotificationEmail } from '../services/emailService.js';

// ES Module equivalent of __dirname for file path construction
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * @desc    Get all students with filtering and pagination
 * @route   GET /api/admin/students
 * @access  Private/Admin
 */
const getStudents = asyncHandler(async (req, res) => {
    const { search, department, batch, status, page = 1, limit = 10 } = req.query;
    let query = { role: 'student' };
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (status) query.status = status;
    
    const students = await User.find(query)
        .populate('department', 'name')
        .populate('batch', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
        
    const count = await User.countDocuments(query);
    res.json({ students, totalPages: Math.ceil(count / limit), currentPage: page });
});

/**
 * @desc    Get complete details for a single student, including submissions
 * @route   GET /api/admin/students/:id/details
 * @access  Private/Admin
 */
const getStudentDetailsById = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const studentProfile = await User.findById(studentId).populate('department', 'name').populate('batch', 'name');
    if (!studentProfile || studentProfile.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }
    const submissions = await AssessmentSubmission.find({ student: studentId }).populate('assessment', 'name deadline').sort({ submittedAt: -1 });
    res.json({ profile: studentProfile, assessmentSubmissions: submissions });
});

/**
 * @desc    Add a single student manually
 * @route   POST /api/admin/students
 * @access  Private/Admin
 */
const addStudent = asyncHandler(async (req, res) => {
    const { fullName, email, department, batch } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Student with this email already exists.');
    }
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const student = await User.create({ fullName, email, password: tempPassword, department, batch, role: 'student', status: 'active' });
    if (student) {
        await sendWelcomeEmail(email, tempPassword);
        res.status(201).json({ _id: student._id, fullName: student.fullName, email: student.email, message: 'Student created successfully. Welcome email sent.' });
    } else {
        res.status(400);
        throw new Error('Invalid student data');
    }
});

/**
 * @desc    Edit a student's details
 * @route   PUT /api/admin/students/:id
 * @access  Private/Admin
 */
const editStudent = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }
    student.fullName = req.body.fullName || student.fullName;
    student.department = req.body.department || student.department;
    student.batch = req.body.batch || student.batch;
    student.status = req.body.status || student.status;
    const updatedStudent = await student.save();
    res.json(updatedStudent);
});

/**
 * @desc    Hard delete a student and all their associated data
 * @route   DELETE /api/admin/students/:id
 * @access  Private/Admin
 */
const deleteStudent = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const student = await User.findById(studentId).session(session);
        if (!student || student.role !== 'student') {
            throw new Error('Student not found');
        }
        
        // 1. Find all documents associated with the student before deleting DB records
        const documentsToDelete = await Document.find({ student: studentId }).session(session);

        // 2. Delete all associated data from various collections within the transaction
        await Document.deleteMany({ student: studentId }, { session });
        await QuizResult.deleteMany({ student: studentId }, { session });
        await Attendance.deleteMany({ student: studentId }, { session });
        await InternshipApplication.deleteMany({ student: studentId }, { session });
        await AssessmentSubmission.deleteMany({ student: studentId }, { session });
        
        // 3. Finally, delete the student's main user record
        await User.findByIdAndDelete(studentId, { session });
        
        // If all database operations were successful, commit the transaction
        await session.commitTransaction();

        // 4. After the transaction is successful, delete the physical PDF files from the server
        for (const doc of documentsToDelete) {
            try {
                // Construct the full, absolute path to the file on the server
                const filePath = path.join(__dirname, '..', doc.fileUrl); // '..' goes up from /controllers to /server
                if (fs.existsSync(filePath)) {
                    await fs.unlink(filePath); // Asynchronously delete the file
                }
            } catch (fileError) {
                // Log an error if a specific file couldn't be deleted, but don't cause the request to fail
                // The critical database cleanup part was already successful.
                console.error(`Failed to delete document file from filesystem: ${doc.fileUrl}`, fileError);
            }
        }
        
        res.status(200).json({ message: 'Student and all associated data (including documents) have been permanently deleted.' });

    } catch (error) {
        // If any operation inside the try block fails, abort the entire transaction
        await session.abortTransaction();
        res.status(400);
        throw new Error(`Failed to delete student data. Reason: ${error.message}. No data was changed.`);
    } finally {
        // Always end the session to release its resources
        session.endSession();
    }
});

/**
 * @desc    Approve a public application and create a student account
 * @route   PUT /api/admin/public-applications/:id/approve
 * @access  Private/Admin
 */
const approveApplication = asyncHandler(async (req, res) => {
    const applicationId = req.params.id;
    const { department, batch } = req.body;
    if (!department || !batch) {
        res.status(400);
        throw new Error('Department and Batch are required for approval.');
    }
    const application = await PublicApplication.findById(applicationId);
    if (!application) {
        res.status(404);
        throw new Error('Application not found.');
    }
    if (application.status === 'approved') {
        res.status(400);
        throw new Error('This application has already been approved.');
    }
    const userExists = await User.findOne({ email: application.email });
    if (userExists) {
        res.status(400);
        throw new Error('A student with this email already exists in the system.');
    }
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const newStudent = await User.create({
        fullName: application.fullName, email: application.email, password: tempPassword,
        mobileNumber: application.mobileNumber, batch: batch,
        department: department, role: 'student', status: 'active',
    });
    if (newStudent) {
        application.status = 'approved';
        await application.save();
        await sendWelcomeEmail(newStudent.email, tempPassword);
        await ActivityLog.create({ eventType: 'STUDENT_APPROVED', message: `New student approved: ${newStudent.fullName}`, relatedUser: newStudent._id });
        res.status(200).json({ message: 'Application approved. Student account created and welcome email sent.' });
    } else {
        res.status(400);
        throw new Error('Failed to create student account.');
    }
});

/**
 * @desc    Bulk upload students via CSV
 * @route   POST /api/admin/students/bulk
 * @access  Private/Admin
 */
const bulkUploadStudents = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a CSV file.');
    }
    const results = [];
    const errors = [];
    const readableStream = Readable.from(req.file.buffer.toString());
    readableStream.pipe(csv()).on('data', (data) => results.push(data)).on('end', async () => {
        for (const studentData of results) {
            try {
                const { name, email, department, batch } = studentData;
                if (!name || !email || !department || !batch) {
                    errors.push({ email: email || 'N/A', reason: 'Missing required fields' });
                    continue;
                }
                const userExists = await User.findOne({ email });
                if (userExists) {
                    errors.push({ email, reason: 'Email already exists' });
                    continue;
                }
                const dept = await Department.findOne({ name: department });
                const bth = await Batch.findOne({ name: batch });
                if (!dept || !bth) {
                    errors.push({ email, reason: `Invalid Department or Batch name` });
                    continue;
                }
                const tempPassword = crypto.randomBytes(8).toString('hex');
                await User.create({
                    fullName: name, email, department: dept._id, batch: bth._id,
                    password: tempPassword, role: 'student', status: 'active',
                });
                await sendWelcomeEmail(email, tempPassword);
            } catch (error) {
                errors.push({ email: studentData.email, reason: error.message });
            }
        }
        res.status(201).json({ message: 'Bulk upload complete.', successCount: results.length - errors.length, errors });
    });
});

/**
 * @desc    Broadcast a notification
 * @route   POST /api/admin/notifications
 * @access  Private/Admin
 */
const sendNotification = asyncHandler(async (req, res) => {
    const { target, department, batch, subject, message } = req.body;
    let query = { role: 'student', status: 'active' };
    if (target === 'department' && department) query.department = department;
    else if (target === 'batch' && batch) query.batch = batch;
    const students = await User.find(query).select('email');
    const emails = students.map(s => s.email);
    if (emails.length > 0) {
        for (const email of emails) {
            await sendNotificationEmail(email, subject, message);
        }
    }
    res.status(200).json({ message: `Notification sent to ${emails.length} students.` });
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/dashboard-stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const internshipsAccepted = await User.countDocuments({ internshipStatus: 'accepted' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const activeQuizzes = await Quiz.countDocuments({ startTime: { $lt: new Date() }, endTime: { $gt: new Date() } });
    const upcomingClasses = await Schedule.countDocuments({ startTime: { $gte: today, $lt: tomorrow } });
    const classesToday = await Schedule.find({ startTime: { $gte: today, $lt: tomorrow } }).select('_id batch');
    const classIdsToday = classesToday.map(c => c._id);
    const totalAttendanceToday = await Attendance.countDocuments({ schedule: { $in: classIdsToday } });
    const totalScheduledStudentsToday = await User.countDocuments({
        batch: { $in: classesToday.map(c => c.batch).filter(b => b) },
        role: 'student'
    });
    const attendanceRateToday = totalScheduledStudentsToday > 0 ? (totalAttendanceToday / totalScheduledStudentsToday) * 100 : 0;
    res.json({
        totalStudents,
        attendanceRate: attendanceRateToday.toFixed(2),
        activeQuizzes,
        upcomingClasses,
        internshipsAccepted,
    });
});

/**
 * @desc    Get recent system activities for the dashboard feed
 * @route   GET /api/admin/activities
 * @access  Private/Admin
 */
const getRecentActivities = asyncHandler(async (req, res) => {
    const activities = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(10);
    res.json(activities);
});

export {
    getStudents,
    addStudent,
    editStudent,
    deleteStudent,
    getDashboardStats,
    approveApplication,
    bulkUploadStudents,
    sendNotification,
    getStudentDetailsById,
    getRecentActivities,
};