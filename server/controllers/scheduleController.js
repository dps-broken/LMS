import asyncHandler from 'express-async-handler';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// --- ADMIN CONTROLLERS ---

// @desc    Schedule a new class
// @route   POST /api/admin/schedule
// @access  Private/Admin
const createSchedule = asyncHandler(async (req, res) => {
    // Destructure the new 'attendanceWindow' field from the request body
    const { topic, department, batch, instructor, startTime, endTime, meetingLink, meetingId, passcode, attendanceWindow } = req.body;

    const schedule = new Schedule({
        topic,
        department,
        batch,
        instructor,
        startTime,
        endTime,
        meetingLink,
        meetingId,
        passcode,
        attendanceWindow // Save the new field to the database
    });

    const createdSchedule = await schedule.save();
    
    // In a real app, you might add a notification service call here
    
    res.status(201).json(createdSchedule);
});

// @desc    Get all scheduled classes
// @route   GET /api/admin/schedule
// @access  Private/Admin
const getSchedules = asyncHandler(async (req, res) => {
    const schedules = await Schedule.find({})
        .populate('department', 'name')
        .populate('batch', 'name')
        .sort({ startTime: -1 });
    res.json(schedules);
});

// @desc    Update a scheduled class
// @route   PUT /api/admin/schedule/:id
// @access  Private/Admin
const updateSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);

    if (schedule) {
        schedule.topic = req.body.topic || schedule.topic;
        schedule.department = req.body.department || schedule.department;
        schedule.batch = req.body.batch || schedule.batch;
        schedule.instructor = req.body.instructor || schedule.instructor;
        schedule.startTime = req.body.startTime || schedule.startTime;
        schedule.endTime = req.body.endTime || schedule.endTime;
        schedule.meetingLink = req.body.meetingLink || schedule.meetingLink;
        schedule.meetingId = req.body.meetingId || schedule.meetingId;
        schedule.passcode = req.body.passcode || schedule.passcode;
        schedule.attendanceWindow = req.body.attendanceWindow || schedule.attendanceWindow; // Update the new field

        const updatedSchedule = await schedule.save();
        res.json(updatedSchedule);
    } else {
        res.status(404);
        throw new Error('Scheduled class not found');
    }
});

// @desc    Delete a scheduled class
// @route   DELETE /api/admin/schedule/:id
// @access  Private/Admin
const deleteSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);
    if (schedule) {
        await schedule.deleteOne();
        await Attendance.deleteMany({ schedule: req.params.id });
        res.json({ message: 'Scheduled class removed' });
    } else {
        res.status(404);
        throw new Error('Scheduled class not found');
    }
});

// @desc    Get real-time and historical attendance for a class
// @route   GET /api/admin/attendance
// @access  Private/Admin
const getAttendanceMonitoring = asyncHandler(async (req, res) => {
    const { scheduleId, date, batch, department } = req.query;

    let query = {};
    if (scheduleId) {
        query.schedule = scheduleId;
    }
    
    const attendanceRecords = await Attendance.find(query)
        .populate('student', 'fullName email')
        .populate('schedule', 'topic startTime');

    res.json(attendanceRecords);
});


// --- STUDENT CONTROLLERS ---

// @desc    Get upcoming class schedule for the logged-in student
// @route   GET /api/student/schedule
// @access  Private/Student
const getStudentSchedule = asyncHandler(async (req, res) => {
    const schedules = await Schedule.find({
        batch: req.user.batch,
    }).sort({ startTime: 1 });

    res.json(schedules);
});

export {
    createSchedule,
    getSchedules,
    updateSchedule,
    deleteSchedule,
    getAttendanceMonitoring,
    getStudentSchedule
};