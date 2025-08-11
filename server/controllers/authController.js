import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendOtpEmail } from '../services/emailService.js';
import generateOTP from '../utils/otpGenerator.js';

/**
 * @desc    Verify OTP for account activation (part of the old, removed public signup flow)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
        email, 
        otp,
        otpExpires: { $gt: Date.now() } 
    }).select('+otp +otpExpires');

    if (!user) {
        res.status(400);
        throw new Error('Invalid OTP or OTP has expired');
    }

    user.status = 'active';
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    const token = generateToken(res, user._id, user.role);
    res.status(200).json({
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: token,
        message: "Account activated successfully."
    });
});

/**
 * @desc    Auth user (student) & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Explicitly select the password field, which is excluded by default in the model.
    const user = await User.findOne({ email }).select('+password');

    // Handle cases where the user is found but not eligible to log in.
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }
    if (user.status === 'pending') {
        res.status(401);
        throw new Error('Account is pending verification.');
    }
    if (user.status === 'inactive') {
        res.status(401);
        throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    // Check if the provided password matches the hashed password in the database.
    if (await user.matchPassword(password)) {
        const token = generateToken(res, user._id, user.role);
        res.json({
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

/**
 * @desc    Specific login for admin panel
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Explicitly select the password field for the admin user.
    const adminUser = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!adminUser) {
        res.status(401);
        throw new Error('Invalid admin credentials.');
    }

    // Check if the provided password matches the admin's hashed password.
    if (await adminUser.matchPassword(password)) {
        const token = generateToken(res, adminUser._id, adminUser.role);
        res.json({
            _id: adminUser._id.toString(),
            fullName: adminUser.fullName,
            email: adminUser.email,
            role: adminUser.role,
            token,
        });
    } else {
        res.status(401);
        throw new Error('Invalid admin credentials.');
    }
});

/**
 * @desc    Forgot Password - Request an OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        // To prevent "email enumeration" (hackers checking which emails exist),
        // we always return a success-like message.
        return res.status(200).json({ message: 'If a user with that email exists, a password reset OTP has been sent.' });
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(email, otp, 'Password Reset Request');
    res.status(200).json({ message: 'If a user exists, a password reset OTP has been sent.' });
});

/**
 * @desc    Reset Password using a valid OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;
    if (!password || password.length < 8) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long.');
    }
    const user = await User.findOne({ 
        email, 
        otp, 
        otpExpires: { $gt: Date.now() } 
    }).select('+otp +otpExpires');

    if (!user) {
        res.status(400);
        throw new Error('Invalid OTP or OTP has expired. Please request a new one.');
    }
    // Set new password (hashing is handled by pre-save middleware in the User model)
    user.password = password;
    // Clear the OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been updated successfully. Please log in.' });
});

/**
 * @desc    Logout user (stateless operation)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = (req, res) => {
  // On the client-side, the token should be cleared from localStorage.
  // This endpoint just provides a confirmation.
  res.status(200).json({ message: 'Logged out successfully' });
};

export {
    verifyOtp,
    loginUser,
    loginAdmin,
    forgotPassword,
    resetPassword,
    logoutUser,
};