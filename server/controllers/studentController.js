import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

// Import local models
import User from '../models/User.js';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';
import Document from '../models/Document.js'; // This model is used by acceptOfferLetter
import InternshipApplication from '../models/InternshipApplication.js'; // Also used by acceptOfferLetter

/**
 * @desc    Get the profile of the currently logged-in student
 * @route   GET /api/student/profile
 * @access  Private/Student
 */
const getStudentProfile = asyncHandler(async (req, res) => {
    const student = await User.findById(req.user._id)
        .populate('department', 'name')
        .populate('batch', 'name');

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

/**
 * @desc    Update the profile of the currently logged-in student
 * @route   PUT /api/student/profile
 * @access  Private/Student
 */
const updateStudentProfile = asyncHandler(async (req, res) => {
    const student = await User.findById(req.user._id).select('+password');

    if (student) {
        student.mobileNumber = req.body.mobileNumber || student.mobileNumber;

        // Logic for updating the password
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

/**
 * @desc    Update the profile image of the currently logged-in student
 * @route   PUT /api/student/profile/image
 * @access  Private/Student
 */
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
 * @desc    Checks for a currently active attendance marking session for the student
 * @route   GET /api/student/attendance/active
 * @access  Private/Student
 */
const getActiveAttendance = asyncHandler(async (req, res) => {
    const now = new Date();
    const student = req.user;
    const schedules = await Schedule.find({ batch: student.batch, startTime: { $lte: now } }).sort({ startTime: -1 });

    if (!schedules.length) {
        return res.json(null);
    }

    for (const schedule of schedules) {
        const startTime = new Date(schedule.startTime);
        const windowMinutes = schedule.attendanceWindow || 15;
        const endTime = new Date(startTime.getTime() + windowMinutes * 60000);

        if (now >= startTime && now <= endTime) {
            const alreadyMarked = await Attendance.findOne({ schedule: schedule._id, student: student._id });
            if (!alreadyMarked) {
                return res.json(schedule);
            }
        }
    }
    return res.json(null);
});

/**
 * @desc    Mark attendance for a specific class
 * @route   POST /api/student/attendance/:id/mark
 * @access  Private/Student
 */
const markAttendance = asyncHandler(async (req, res) => {
    const scheduleId = req.params.id;
    const alreadyMarked = await Attendance.findOne({ schedule: scheduleId, student: req.user._id });

    if (alreadyMarked) {
        res.status(400);
        throw new Error('Attendance already marked for this class.');
    }
    
    const attendance = new Attendance({ schedule: scheduleId, student: req.user._id, status: 'present' });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully' });
});

/**
 * @desc    Get a summary of the student's attendance history
 * @route   GET /api/student/attendance/summary
 * @access  Private/Student
 */
const getAttendanceSummary = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const batchId = req.user.batch;
    const totalClassesScheduled = await Schedule.countDocuments({ batch: batchId });
    const attendedClasses = await Attendance.find({ student: studentId }).populate({ path: 'schedule', select: 'startTime topic' });
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

/**
 * @desc    Accept an internship offer letter, updating user and application status
 * @route   PUT /api/student/documents/offer/:id/accept
 * @access  Private/Student
 */
const acceptOfferLetter = asyncHandler(async (req, res) => {
    // 1. Verify that the document is a valid offer letter for this student.
    const document = await Document.findById(req.params.id);
    if (!document || document.student.toString() !== req.user._id.toString() || document.type !== 'offer_letter') {
        res.status(404);
        throw new Error('Offer letter not found or invalid.');
    }
    
    // 2. Find the user record to update.
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('Student user not found.');
    }
    
    // 3. Update the student's internship status.
    user.internshipStatus = 'accepted';
    const updatedUser = await user.save();
    
    // 4. Also update the status on the original application document for data consistency.
    await InternshipApplication.findOneAndUpdate({ student: req.user._id }, { status: 'accepted' });

    // 5. Send a success response including the updated status.
    //    This allows the frontend to update its global state without another API call.
    res.json({ 
        message: 'Offer accepted successfully! Your status has been updated.',
        internshipStatus: updatedUser.internshipStatus 
    });
});

export {
    getStudentProfile,
    updateStudentProfile,
    updateProfileImage,
    getActiveAttendance,
    markAttendance,
    getAttendanceSummary,
    acceptOfferLetter,
};