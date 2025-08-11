import asyncHandler from 'express-async-handler';
import Department from '../models/Department.js';
import User from '../models/User.js';

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
        res.status(400);
        throw new Error('Department already exists');
    }

    const department = new Department({ name });
    const createdDepartment = await department.save();
    res.status(201).json(createdDepartment);
});

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private/Admin
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({});
    res.json(departments);
});

// @desc    Update a department
// @route   PUT /api/admin/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const department = await Department.findById(req.params.id);

    if (department) {
        department.name = name || department.name;
        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } else {
        res.status(404);
        throw new Error('Department not found');
    }
});

// @desc    Delete a department
// @route   DELETE /api/admin/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
    const departmentId = req.params.id;
    const studentCount = await User.countDocuments({ department: departmentId });
    if (studentCount > 0) {
        res.status(400);
        throw new Error('Cannot delete department with assigned students');
    }
    
    const department = await Department.findById(departmentId);
    if (department) {
        await department.deleteOne();
        res.json({ message: 'Department removed' });
    } else {
        res.status(404);
        throw new Error('Department not found');
    }
});

export {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
};