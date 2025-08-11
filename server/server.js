import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // <-- Use the built-in 'fs' module

// Import local modules
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import allRoutes from './routes/index.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- THIS IS THE GUARANTEED DIRECTORY CREATION FIX ---
// Define the paths for all required upload subdirectories.
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const profilesDir = path.join(uploadsDir, 'profiles');
const documentsDir = path.join(uploadsDir, 'documents');

// Use the built-in fs.mkdirSync to create each directory if it doesn't exist.
// The { recursive: true } option is like 'mkdir -p' - it creates parent directories if needed.
try {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir);
    if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir);
    if (!fs.existsSync(documentsDir)) fs.mkdirSync(documentsDir);
    console.log("Upload directories are verified and ready.");
} catch (error) {
    console.error("CRITICAL ERROR: Could not create upload directories.", error);
    process.exit(1); // Exit if we can't create necessary folders
}
// ---------------------------------------------------

// Serve the entire 'uploads' directory statically
app.use('/uploads', express.static(uploadsDir));

// Attach all API routes to the '/api' prefix
app.use('/api', allRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});