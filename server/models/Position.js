import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
    // The title of the internship position, e.g., "Frontend Developer Intern"
    title: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    // A brief description of the role
    description: {
        type: String,
        required: true,
    },
    // Status to control visibility on the public application form
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Position = mongoose.model('Position', positionSchema);

export default Position;