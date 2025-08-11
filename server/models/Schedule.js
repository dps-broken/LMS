import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  instructor: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  meetingLink: { type: String },
  meetingId: { type: String },
  passcode: { type: String },
  // The duration in minutes after the class starts that students can mark attendance.
  attendanceWindow: { type: Number, default: 15, min: 1, required: true } 
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;