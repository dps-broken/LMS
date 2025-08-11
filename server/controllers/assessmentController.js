import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Import mongoose for transactions
import Assessment from '../models/Assessment.js';
import AssessmentSubmission from '../models/AssessmentSubmission.js';

// --- ADMIN CONTROLLERS ---

const createAssessment = asyncHandler(async (req, res) => {
    const { name, description, deadline, batch } = req.body;
    const assessment = await Assessment.create({ name, description, deadline, batch });
    res.status(201).json(assessment);
});

const getAssessments = asyncHandler(async (req, res) => {
    const assessments = await Assessment.find({}).populate('batch', 'name').sort({ deadline: -1 });
    res.json(assessments);
});

const getSubmissionsForAssessment = asyncHandler(async (req, res) => {
    const submissions = await AssessmentSubmission.find({ assessment: req.params.id })
        .populate('student', 'fullName email')
        .sort({ submittedAt: -1 });
    res.json(submissions);
});

const deleteAssessment = asyncHandler(async (req, res) => {
    const assessment = await Assessment.findById(req.params.id);
    if (assessment) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await AssessmentSubmission.deleteMany({ assessment: req.params.id }, { session });
            await assessment.deleteOne({ session });
            await session.commitTransaction();
            res.json({ message: 'Assessment and all its submissions have been permanently removed.' });
        } catch (error) {
            await session.abortTransaction();
            res.status(500);
            throw new Error(`Failed to delete assessment. Reason: ${error.message}`);
        } finally {
            session.endSession();
        }
    } else {
        res.status(404);
        throw new Error('Assessment not found');
    }
});

// --- STUDENT CONTROLLERS ---

const getActiveAssessmentsForStudent = asyncHandler(async (req, res) => {
    const now = new Date();
    const activeAssessments = await Assessment.find({ batch: req.user.batch, deadline: { $gt: now } }).lean();
    const studentSubmissions = await AssessmentSubmission.find({ student: req.user._id }).select('assessment');
    const submittedIds = new Set(studentSubmissions.map(sub => sub.assessment.toString()));
    const assessmentsWithStatus = activeAssessments.map(assessment => ({
        ...assessment,
        isSubmitted: submittedIds.has(assessment._id.toString())
    }));
    res.json(assessmentsWithStatus);
});

const submitAssessment = asyncHandler(async (req, res) => {
    const assessmentId = req.params.id;
    const { githubLink, description } = req.body;
    const studentId = req.user._id;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) { res.status(404); throw new Error('Assessment not found.'); }
    if (new Date() > new Date(assessment.deadline)) { res.status(400); throw new Error('The submission deadline has passed.'); }
    const existingSubmission = await AssessmentSubmission.findOne({ assessment: assessmentId, student: studentId });
    if (existingSubmission) { res.status(400); throw new Error('You have already submitted this assessment.'); }
    const submission = await AssessmentSubmission.create({ assessment: assessmentId, student: studentId, githubLink, description });
    res.status(201).json({ message: 'Assessment submitted successfully!', submission });
});

export {
    createAssessment,
    getAssessments,
    getSubmissionsForAssessment,
    getActiveAssessmentsForStudent,
    submitAssessment,
    deleteAssessment,
};