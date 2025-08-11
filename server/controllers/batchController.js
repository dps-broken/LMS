import asyncHandler from 'express-async-handler';
import Batch from '../models/Batch.js';

// @desc    Create a new batch with all details
// @route   POST /api/admin/batches
// @access  Private/Admin
const createBatch = asyncHandler(async (req, res) => {
    // Destructure all the new fields from the request body
    const { name, department, startTime, endTime, instructorName, instructorPosition } = req.body;
    
    const batchExists = await Batch.findOne({ name });
    if (batchExists) {
        res.status(400);
        throw new Error('Batch with this name already exists');
    }

    const batch = new Batch({
        name,
        department,
        startTime,
        endTime,
        instructorName,
        instructorPosition
    });

    const createdBatch = await batch.save();
    res.status(201).json(createdBatch);
});

// @desc    Get all batches
// @route   GET /api/admin/batches
// @access  Private/Admin
const getBatches = asyncHandler(async (req, res) => {
    // We MUST populate the 'department' field to get the course name
    const batches = await Batch.find({}).populate('department', 'name').sort({ startTime: -1 });
    res.json(batches);
});

// @desc    Update a batch
// @route   PUT /api/admin/batches/:id
// @access  Private/Admin
const updateBatch = asyncHandler(async (req, res) => {
    const { name, department, startTime, endTime, instructorName, instructorPosition } = req.body;
    const batch = await Batch.findById(req.params.id);

    if (batch) {
        batch.name = name || batch.name;
        batch.department = department || batch.department;
        batch.startTime = startTime || batch.startTime;
        batch.endTime = endTime || batch.endTime;
        batch.instructorName = instructorName || batch.instructorName;
        batch.instructorPosition = instructorPosition || batch.instructorPosition;
        
        const updatedBatch = await batch.save();
        res.json(updatedBatch);
    } else {
        res.status(404);
        throw new Error('Batch not found');
    }
});

// @desc    Delete a batch
// @route   DELETE /api/admin/batches/:id
// @access  Private/Admin
const deleteBatch = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id);

    if (batch) {
        // In a real-world app, you'd add checks to see if students are assigned to this batch
        await batch.deleteOne();
        res.json({ message: 'Batch removed' });
    } else {
        res.status(404);
        throw new Error('Batch not found');
    }
});

export { createBatch, getBatches, updateBatch, deleteBatch };