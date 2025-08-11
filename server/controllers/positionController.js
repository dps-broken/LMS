import asyncHandler from 'express-async-handler';
import Position from '../models/Position.js';

// --- ADMIN CONTROLLERS ---

// @desc    Create a new position/opening
// @route   POST /api/admin/positions
// @access  Private/Admin
const createPosition = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const positionExists = await Position.findOne({ title });
    if (positionExists) {
        res.status(400);
        throw new Error('A position with this title already exists.');
    }
    const position = await Position.create({ title, description });
    res.status(201).json(position);
});

// @desc    Get all positions
// @route   GET /api/admin/positions
// @access  Private/Admin
const getPositions = asyncHandler(async (req, res) => {
    const positions = await Position.find({}).sort({ createdAt: -1 });
    res.json(positions);
});

// @desc    Update a position
// @route   PUT /api/admin/positions/:id
// @access  Private/Admin
const updatePosition = asyncHandler(async (req, res) => {
    const { title, description, isActive } = req.body;
    const position = await Position.findById(req.params.id);
    if (position) {
        position.title = title || position.title;
        position.description = description || position.description;
        position.isActive = isActive !== undefined ? isActive : position.isActive;
        const updatedPosition = await position.save();
        res.json(updatedPosition);
    } else {
        res.status(404);
        throw new Error('Position not found.');
    }
});

// @desc    Delete a position
// @route   DELETE /api/admin/positions/:id
// @access  Private/Admin
const deletePosition = asyncHandler(async (req, res) => {
    const position = await Position.findById(req.params.id);
    if (position) {
        await position.deleteOne();
        res.json({ message: 'Position removed successfully.' });
    } else {
        res.status(404);
        throw new Error('Position not found.');
    }
});


// --- PUBLIC CONTROLLER ---

// @desc    Get only active positions for the public application form
// @route   GET /api/public/positions
// @access  Public
const getActivePositions = asyncHandler(async (req, res) => {
    const positions = await Position.find({ isActive: true }).select('title');
    res.json(positions);
});

export {
    createPosition,
    getPositions,
    updatePosition,
    deletePosition,
    getActivePositions,
};