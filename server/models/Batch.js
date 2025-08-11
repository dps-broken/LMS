import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    // The existing 'name' field for the batch identifier (e.g., "Summer Interns 2025")
    name: { type: String, required: true, unique: true, trim: true },

    // --- NEW FIELDS ---
    // Link to a Department, which represents the Course.
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    
    // Start and End dates for the batch program.
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    // Details about the instructor for this batch.
    instructorName: { type: String, required: true },
    instructorPosition: { type: String, required: true },

}, { timestamps: true });

const Batch = mongoose.model('Batch', batchSchema);

export default Batch;