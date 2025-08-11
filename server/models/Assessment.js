import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
    // Name of the assessment, e.g., "Final Project Submission"
    name: { 
        type: String, 
        required: [true, 'Assessment name is required.'],
        trim: true 
    },
    // Detailed description or instructions for the student
    description: { 
        type: String, 
        required: [true, 'Description is required.'] 
    },
    // The deadline for submissions
    deadline: { 
        type: Date, 
        required: [true, 'Submission deadline is required.'] 
    },
    // The specific batch this assessment is for
    batch: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Batch', 
        required: [true, 'A target batch must be selected.'] 
    },
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;