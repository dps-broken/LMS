// /server/models/InternshipApplication.js
import mongoose from 'mongoose';

const internshipApplicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Assuming one application per student for simplicity
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String }, // Rich text content
  portfolioLinks: {
    github: String,
    linkedin: String,
    other: String,
  },
  status: { type: String, enum: ['applied', 'under review', 'shortlisted', 'rejected', 'offered'], default: 'applied' },
}, { timestamps: true });

const InternshipApplication = mongoose.model('InternshipApplication', internshipApplicationSchema);
export default InternshipApplication;