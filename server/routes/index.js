import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import studentRoutes from './studentRoutes.js';
import publicRoutes from './publicRoutes.js';

const router = express.Router();

// Public routes that do not require token authentication
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);

// Protected routers that handle their own internal protection
router.use('/student', studentRoutes);
router.use('/admin', adminRoutes);

export default router;