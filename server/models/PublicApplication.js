import mongoose from 'mongoose';

const publicApplicationSchema = new mongoose.Schema({
    // Personal Details from the public form
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'] },
    
    // --- THIS IS THE FIX ---
    // The 'batch' field is removed and replaced with 'positionTitle'.
    positionTitle: { 
        type: String, 
        required: [true, 'A position must be selected.'] 
    },
    // -----------------------

    // Application materials
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String },
    portfolioLinks: {
        github: String,
        linkedin: String,
    },
    
    // Application status controlled by the Admin
    status: { 
        type: String, 
        enum: ['pending', 'shortlisted', 'approved', 'rejected'], 
        default: 'pending' 
    },
}, { timestamps: true });

const PublicApplication = mongoose.model('PublicApplication', publicApplicationSchema);

export default PublicApplication;