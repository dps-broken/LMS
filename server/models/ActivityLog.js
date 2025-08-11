import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    // A machine-readable type for the event, e.g., 'USER_REGISTERED'
    eventType: {
        type: String,
        required: true,
        enum: [
            'STUDENT_APPROVED', // When an admin approves an application
            'QUIZ_SUBMITTED',   // When a student submits a quiz
            'APP_SUBMITTED',    // When a person submits a public application
        ]
    },
    // A human-readable message describing the event
    message: {
        type: String,
        required: true,
    },
    // Optional: link to the user or item related to the event for future linking
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true }); // `createdAt` will serve as the event timestamp

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;