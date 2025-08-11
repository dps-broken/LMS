import asyncHandler from 'express-async-handler';
import Quiz from '../models/Quiz.js';
import Schedule from '../models/Schedule.js';
import mongoose from 'mongoose';
import { format } from 'date-fns'; // Import date-fns for formatting

// Middleware to check if the current time is within a quiz's scheduled time slot
export const checkQuizTime = asyncHandler(async (req, res, next) => {
    const quizId = req.params.id || req.body.quizId;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        res.status(400);
        throw new Error('Invalid quiz ID');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    const now = new Date();
    if (now < new Date(quiz.startTime) || now > new Date(quiz.endTime)) {
        res.status(403);
        throw new Error('Quiz is not active at this time.');
    }
    
    next();
});

// Middleware to check if the current time is within the attendance marking window for a class
export const checkAttendanceWindow = asyncHandler(async (req, res, next) => {
    const scheduleId = req.params.id || req.body.scheduleId;
     if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
        res.status(400);
        throw new Error('Invalid schedule ID');
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
        res.status(404);
        throw new Error('Scheduled class not found');
    }

    const now = new Date();
    const startTime = new Date(schedule.startTime);

    // Use the dynamic 'attendanceWindow' value from the database.
    // Default to 15 minutes if the value is somehow missing, for safety.
    const windowMinutes = schedule.attendanceWindow || 15;
    const endTime = new Date(startTime.getTime() + windowMinutes * 60000);

    // The logic to check the window is now dynamic and provides a user-friendly error
    if (now < startTime || now > endTime) {
        res.status(403);
        throw new Error(`Attendance marking is only open from ${format(startTime, 'p')} to ${format(endTime, 'p')}.`);
    }

    next();
});