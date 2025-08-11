import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private/Student
const getStudentProfile = asyncHandler(async (req, res) => {
    const student = await User.findById(req.user._id)
        .populate('department')
        .populate('batch');

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    res.json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        batch: student.batch,
        mobileNumber: student.mobileNumber,
        profileImage: student.profileImage,
        status: student.status,
        internshipStatus: student.internshipStatus,
    });
});

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private/Student
const updateStudentProfile = asyncHandler(async (req, res) => {
    const student = await User.findById(req.user._id).select('+password');

    if (student) {
        student.mobileNumber = req.body.mobileNumber || student.mobileNumber;
        if (req.body.password) {
            if (!req.body.currentPassword) {
                res.status(400);
                throw new Error('Current password is required to change password');
            }
            const isMatch = await student.matchPassword(req.body.currentPassword);
            if (!isMatch) {
                res.status(401);
                throw new Error('Incorrect current password');
            }
            student.password = req.body.password;
        }
        const updatedStudent = await student.save();
        res.json({
            _id: updatedStudent._id,
            fullName: updatedStudent.fullName,
            email: updatedStudent.email,
            mobileNumber: updatedStudent.mobileNumber,
            profileImage: updatedStudent.profileImage,
            message: 'Profile updated successfully',
        });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Update student profile image
// @route   PUT /api/student/profile/image
// @access  Private/Student
const updateProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image file.');
    }
    const user = await User.findById(req.user._id);
    if (user) {
        user.profileImage = `/uploads/profiles/${req.file.filename}`;
        await user.save();
        res.json({
            message: 'Profile image updated successfully',
            profileImage: user.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * Checks for a currently active attendance marking session for the logged-in student.
 * @desc    Get active attendance session for student
 * @route   GET /api/student/attendance/active
 * @access  Private/Student
 */
const getActiveAttendance = asyncHandler(async (req, res) => {
    const now = new Date();
    const student = req.user;

    const schedules = await Schedule.find({
        batch: student.batch,
        startTime: { $lte: now }
    }).sort({ startTime: -1 });

    if (!schedules.length) {
        return res.json(null);
    }

    for (const schedule of schedules) {
        const startTime = new Date(schedule.startTime);
        const windowMinutes = schedule.attendanceWindow || 15;
        const endTime = new Date(startTime.getTime() + windowMinutes * 60000);

        if (now >= startTime && now <= endTime) {
            const alreadyMarked = await Attendance.findOne({
                schedule: schedule._id,
                student: student._id
            });
            
            if (!alreadyMarked) {
                return res.json(schedule);
            }
        }
    }
    return res.json(null);
});

// @desc    Mark attendance for a class
// @route   POST /api/student/attendance/:id
// @access  Private/Student
const markAttendance = asyncHandler(async (req, res) => {
    const scheduleId = req.params.id;
    const alreadyMarked = await Attendance.findOne({
        schedule: scheduleId,
        student: req.user._id,
    });
    if (alreadyMarked) {
        res.status(400);
        throw new Error('Attendance already marked for this class.');
    }
    const attendance = new Attendance({
        schedule: scheduleId,
        student: req.user._id,
        status: 'present',
    });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully' });
});

// @desc    Get student's attendance summary
// @route   GET /api/student/attendance/summary
// @access  Private/Student
const getAttendanceSummary = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const batchId = req.user.batch;
    const totalClassesScheduled = await Schedule.countDocuments({ batch: batchId });
    const attendedClasses = await Attendance.find({ student: studentId }).populate({
        path: 'schedule',
        select: 'startTime topic'
    });
    const totalClassesAttended = attendedClasses.length;
    const percentage = totalClassesScheduled > 0 ? (totalClassesAttended / totalClassesScheduled) * 100 : 0;
    const detailedList = await Schedule.find({ batch: batchId }).sort({ startTime: -1 });
    const attendanceMap = new Map(attendedClasses.map(att => [att.schedule._id.toString(), att.status]));
    const attendanceStatusList = detailedList.map(sch => ({
        topic: sch.topic,
        date: sch.startTime,
        status: attendanceMap.get(sch._id.toString()) || 'absent',
    }));
    res.json({
        percentageAttended: percentage.toFixed(2),
        totalClassesAttended,
        totalClassesScheduled,
        attendanceRecords: attendanceStatusList,
    });
});

export {
    getStudentProfile,
    updateStudentProfile,
    updateProfileImage,
    markAttendance,
    getAttendanceSummary,
    getActiveAttendance, // The new function is exported here
};