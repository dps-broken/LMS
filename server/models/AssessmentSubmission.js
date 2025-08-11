import mongoose from 'mongoose';

const assessmentSubmissionSchema = new mongoose.Schema({
    // Link to the parent Assessment
    assessment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assessment', 
        required: true 
    },
    // Link to the student who submitted it
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // The GitHub link provided by the student
    githubLink: { 
        type: String, 
        required: [true, 'A GitHub repository link is required.']
    },
    // The description provided by the student
    description: { 
        type: String,
        required: [true, 'A submission description is required.']
    },
    // The date/time of the submission
    submittedAt: { 
        type: Date, 
        default: Date.now 
    },
}, { timestamps: true });

// This index ensures a student can only submit a specific assessment once.
assessmentSubmissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

const AssessmentSubmission = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);

export default AssessmentSubmission;