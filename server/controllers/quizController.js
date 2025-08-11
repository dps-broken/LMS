import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Import mongoose for transactions
import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

// --- ADMIN CONTROLLERS ---

const createQuiz = asyncHandler(async (req, res) => {
    const { title, department, batch, startTime, endTime, questions } = req.body;
    const quiz = new Quiz({ title, department, batch, startTime, endTime, questions });
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
});

const getQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({}).populate('department', 'name').populate('batch', 'name').sort({ createdAt: -1 });
    const now = new Date();
    const quizzesWithStatus = quizzes.map(quiz => {
        let status = 'upcoming';
        if (now > new Date(quiz.endTime)) status = 'ended';
        else if (now >= new Date(quiz.startTime)) status = 'active';
        return { ...quiz.toObject(), status };
    });
    res.json(quizzesWithStatus);
});

const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) res.json(quiz);
    else { res.status(404); throw new Error('Quiz not found'); }
});

const updateQuiz = asyncHandler(async (req, res) => {
    const { title, department, batch, startTime, endTime, questions } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
        quiz.title = title || quiz.title;
        quiz.department = department || quiz.department;
        quiz.batch = batch || quiz.batch;
        quiz.startTime = startTime || quiz.startTime;
        quiz.endTime = endTime || quiz.endTime;
        quiz.questions = questions || quiz.questions;
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } else {
        res.status(404);
        throw new Error('Quiz not found');
    }
});

const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await QuizResult.deleteMany({ quiz: req.params.id }, { session });
            await quiz.deleteOne({ session });
            await session.commitTransaction();
            res.json({ message: 'Quiz and all its submissions have been permanently removed.' });
        } catch (error) {
            await session.abortTransaction();
            res.status(500);
            throw new Error(`Failed to delete quiz. Reason: ${error.message}`);
        } finally {
            session.endSession();
        }
    } else {
        res.status(404);
        throw new Error('Quiz not found');
    }
});

const publishQuizResults = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) { res.status(404); throw new Error('Quiz not found'); }
    quiz.resultsPublished = req.body.publish;
    await quiz.save();
    res.json({ message: `Quiz results have been ${quiz.resultsPublished ? 'published' : 'unpublished'}.` });
});

const getQuizSubmissions = asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ quiz: req.params.id }).populate('student', 'fullName email').sort({ score: -1 });
    if (results.length === 0) {
        return res.json({ submissions: [], analytics: { participationRate: 0, averageScore: 0, highestScore: 0, lowestScore: 0 } });
    }
    const quiz = await Quiz.findById(req.params.id);
    const totalStudentsInBatch = await User.countDocuments({ batch: quiz.batch });
    const scores = results.map(r => r.score);
    const analytics = {
        participationRate: totalStudentsInBatch > 0 ? (results.length / totalStudentsInBatch) * 100 : 0,
        averageScore: scores.reduce((a, b) => a + b, 0) / results.length,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
    };
    res.json({ submissions: results, analytics });
});

// --- STUDENT CONTROLLERS ---
const getStudentQuizzes = asyncHandler(async (req, res) => {
    const student = req.user;
    const now = new Date();
    const quizzes = await Quiz.find({ department: student.department, batch: student.batch }).sort({ startTime: 1 });
    const studentQuizResults = await QuizResult.find({ student: student._id }).select('quiz score');
    const resultsMap = new Map(studentQuizResults.map(r => [r.quiz.toString(), r.score]));
    const categorizedQuizzes = { upcoming: [], active: [], completed: [] };
    quizzes.forEach(quiz => {
        const quizObj = quiz.toObject();
        const quizIdString = quiz._id.toString();
        if (resultsMap.has(quizIdString)) {
            quizObj.score = resultsMap.get(quizIdString);
            quizObj.totalMarks = quiz.questions.reduce((acc, q) => acc + q.marks, 0);
            categorizedQuizzes.completed.push(quizObj);
        } else if (now >= new Date(quiz.startTime) && now <= new Date(quiz.endTime)) {
            categorizedQuizzes.active.push(quizObj);
        } else if (now < new Date(quiz.startTime)) {
            categorizedQuizzes.upcoming.push(quizObj);
        } else if (now > new Date(quiz.endTime)) {
            quizObj.notAttempted = true;
            categorizedQuizzes.completed.push(quizObj);
        }
    });
    res.json(categorizedQuizzes);
});

const getQuizForStudentAttempt = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');
    if (!quiz) { res.status(404); throw new Error('Quiz not found'); }
    const alreadySubmitted = await QuizResult.findOne({ quiz: req.params.id, student: req.user._id });
    if (alreadySubmitted) { res.status(400); throw new Error('You have already submitted this quiz.'); }
    res.json(quiz);
});

const submitQuiz = asyncHandler(async (req, res) => {
    const quizId = req.params.id;
    const { answers } = req.body;
    const studentId = req.user._id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) { res.status(404); throw new Error('Quiz not found.'); }
    let score = 0;
    const questionMap = new Map(quiz.questions.map(q => [q._id.toString(), q]));
    for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (question && question.correctAnswer === answer.selectedAnswer) {
            score += question.marks;
        }
    }
    const result = await QuizResult.create({ quiz: quizId, student: studentId, score, answers });
    if (result) {
        const student = await User.findById(studentId).select('fullName');
        await ActivityLog.create({
            eventType: 'QUIZ_SUBMITTED',
            message: `${student.fullName} submitted the quiz: "${quiz.title}".`,
            relatedUser: studentId,
            relatedItem: quizId
        });
    }
    res.status(201).json({ message: 'Quiz submitted successfully!', resultId: result._id, score });
});

const getQuizResultForStudent = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) { res.status(404); throw new Error('Quiz not found.'); }
    if (!quiz.resultsPublished) { res.status(403); throw new Error('Results for this quiz have not been published yet.'); }
    const result = await QuizResult.findOne({ quiz: req.params.id, student: req.user._id });
    if (!result) { res.status(404); throw new Error('You have not attempted this quiz.'); }
    const allResults = await QuizResult.find({ quiz: req.params.id }).sort({ score: -1 });
    const rank = allResults.findIndex(r => r.student.toString() === req.user._id.toString()) + 1;
    res.json({ result, quiz, rank });
});

export {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    publishQuizResults,
    getQuizSubmissions,
    getStudentQuizzes,
    getQuizForStudentAttempt,
    submitQuiz,
    getQuizResultForStudent
};