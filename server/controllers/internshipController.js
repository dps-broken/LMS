import asyncHandler from 'express-async-handler';
import PublicApplication from '../models/PublicApplication.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import ActivityLog from '../models/ActivityLog.js'; // New import

// @desc    Submit a new public internship application
const submitPublicApplication = asyncHandler(async (req, res) => {
    const { fullName, email, mobileNumber, positionTitle, coverLetter, portfolioLinks } = req.body;
    const existingApplication = await PublicApplication.findOne({ email });
    if (existingApplication) {
        res.status(400);
        throw new Error('An application with this email has already been submitted.');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('An account with this email already exists. Please log in.');
    }
    if (!req.file) {
        res.status(400);
        throw new Error('Resume is required. Please upload a PDF file.');
    }
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const application = await PublicApplication.create({
        fullName, email, mobileNumber, positionTitle, resumeUrl, coverLetter, portfolioLinks,
    });
    
    // Create an activity log for this event
    if (application) {
        await ActivityLog.create({
            eventType: 'APP_SUBMITTED',
            message: `New internship application received from ${fullName}.`,
            relatedItem: application._id
        });
    }
    
    res.status(201).json({ message: 'Your application has been submitted successfully!' });
});

// @desc    Get all public internship applications
const getAllPublicApplications = asyncHandler(async (req, res) => {
    const applications = await PublicApplication.find({}).sort({ createdAt: -1 });
    res.json(applications);
});

// @desc    Update a public application's status
const updatePublicApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Can only be pending, shortlisted, or rejected.');
    }
    const application = await PublicApplication.findByIdAndUpdate(
        req.params.id, 
        { status },
        { new: true }
    );
    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }
    res.json(application);
});

export {
    submitPublicApplication,
    getAllPublicApplications,
    updatePublicApplicationStatus,
};