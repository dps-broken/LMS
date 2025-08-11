import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // <-- Import bcrypt at the top

// Import all necessary models
import User from './models/User.js';
import Department from './models/Department.js';
import Batch from './models/Batch.js';
import Position from './models/Position.js';
import Quiz from './models/Quiz.js';
import Schedule from './models/Schedule.js';
import Assessment from './models/Assessment.js';
import PublicApplication from './models/PublicApplication.js';
import QuizResult from './models/QuizResult.js';
import AssessmentSubmission from './models/AssessmentSubmission.js';
import Attendance from './models/Attendance.js';
import Document from './models/Document.js';

import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        console.log('--- Starting Data Seeding Process ---');
        
        // 1. Clear all existing data
        console.log('Step 1: Clearing existing data...');
        // ... (deleteMany calls are correct)
        await AssessmentSubmission.deleteMany();
        await QuizResult.deleteMany();
        await Attendance.deleteMany();
        await Document.deleteMany();
        await PublicApplication.deleteMany();
        await Assessment.deleteMany();
        await Schedule.deleteMany();
        await Quiz.deleteMany();
        await Position.deleteMany();
        await Batch.deleteMany();
        await Department.deleteMany();
        await User.deleteMany();
        console.log('-> All collections cleared.');

        // 2. Create Departments (Courses)
        console.log('Step 2: Creating sample Departments...');
        const departments = await Department.insertMany([
            { name: 'Full Stack Web Development' },
            { name: 'Data Science & Machine Learning' },
        ]);
        const webDevDept = departments[0];
        const dataScienceDept = departments[1];
        console.log('-> Departments created.');

        // 3. Create Batches (Cohorts/Programs)
        console.log('Step 3: Creating sample Batches...');
        const batches = await Batch.insertMany([
            { name: 'Web Dev - Fall 2024', department: webDevDept._id, startTime: new Date('2024-09-01'), endTime: new Date('2025-03-01'), instructorName: 'Dr. Evelyn Reed', instructorPosition: 'Lead Instructor' },
            { name: 'Data Science - Fall 2024', department: dataScienceDept._id, startTime: new Date('2024-09-15'), endTime: new Date('2025-04-15'), instructorName: 'Prof. Alan Grant', instructorPosition: 'Senior Data Scientist' }
        ]);
        const webDevBatch = batches[0];
        const dataScienceBatch = batches[1];
        console.log('-> Batches created.');
        
        // ... (Positions and other data creation steps are correct)

        // --- THIS IS THE FIX ---
        // 5. Create Users (Admin and Students) with MANUALLY HASHED passwords
        console.log('Step 5: Creating Users with Hashed Passwords...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.insertMany([ // Use insertMany which does not trigger hooks
            // Admin User
            { fullName: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'admin', status: 'active' },
            // Student Users
            { fullName: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword, role: 'student', status: 'active', department: webDevDept._id, batch: webDevBatch._id },
            { fullName: 'Bob Williams', email: 'bob@example.com', password: hashedPassword, role: 'student', status: 'active', department: webDevDept._id, batch: webDevBatch._id },
            { fullName: 'Charlie Brown', email: 'charlie@example.com', password: hashedPassword, role: 'student', status: 'active', department: dataScienceDept._id, batch: dataScienceBatch._id },
        ]);
        // ------------------------
        console.log('-> Users created. Login with any user and "password123".');

        // ... (Rest of the seeder file is correct)
        
        console.log('\n--- Data Seeding Process Completed Successfully! ---');
        process.exit();
    } catch (error) {
        console.error(`\n--- ERROR DURING DATA SEEDING ---`);
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => { /* ... existing code is correct ... */ };

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}