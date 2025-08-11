// /server/models/QuizResult.js
import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
            selectedAnswer: { type: String, required: true },
        },
    ],
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure a student can only submit a quiz once
quizResultSchema.index({ quiz: 1, student: 1 }, { unique: true });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);
export default QuizResult;

