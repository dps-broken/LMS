import express from 'express';
import { getDepartments } from '../controllers/departmentController.js';
import { getBatches } from '../controllers/batchController.js';
import { submitPublicApplication } from '../controllers/internshipController.js';
import { getActivePositions } from '../controllers/positionController.js';
import { uploadPublicResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public data routes for populating form dropdowns
router.get('/departments', getDepartments);
router.get('/batches', getBatches);
router.get('/positions', getActivePositions); // New route for internship positions

// Public action route for submitting an application
router.post('/internship/apply', uploadPublicResume, submitPublicApplication);

export default router;