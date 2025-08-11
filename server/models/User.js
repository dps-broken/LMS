// /server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  mobileNumber: { type: String, match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'] },
  profileImage: { type: String, default: '/uploads/default-avatar.png' },
  status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
  internshipStatus: { type: String, enum: ['none', 'applied', 'under review', 'shortlisted', 'offered', 'accepted', 'rejected'], default: 'none' },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

