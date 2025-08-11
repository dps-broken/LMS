import express from 'express';
import {
    verifyOtp,
    loginUser,
    loginAdmin,
    forgotPassword,
    resetPassword,
    logoutUser
} from '../controllers/authController.js';

const router = express.Router();

// Public Authentication Routes
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Specific Admin Login Route
router.post('/admin/login', loginAdmin);

export default router;