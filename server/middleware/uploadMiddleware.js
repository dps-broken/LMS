import multer from 'multer';
import path from 'path';
import crypto from 'crypto'; // Import the built-in crypto module
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- THIS IS THE BULLETPROOF FIX FOR PUBLIC UPLOADS ---
const publicResumeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Construct an absolute path from the current file's directory
        // This is robust and works regardless of where you run the server from.
        const uploadPath = path.join(__dirname, '../uploads/resumes');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Since req.body is not available here, we cannot use the applicant's name.
        // The best practice is to generate a unique random name to prevent conflicts.
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// New middleware instance using the corrected storage configuration
export const uploadPublicResume = multer({
    storage: publicResumeStorage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb, ['pdf']);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: Add a 5MB file size limit
}).single('resume');
// ---------------------------------------------------


// --- MIDDLEWARE FOR LOGGED-IN USERS (No change needed, but good to make robust) ---
const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `profile-${req.user._id}${path.extname(file.originalname)}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb, ['jpg', 'jpeg', 'png']);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // Optional: 2MB limit for profile pics
}).single('profileImage');


// --- GENERIC AND ADMIN MIDDLEWARE (No changes needed) ---

// Generic file type checker function
function checkFileType(file, cb, allowedTypes) {
  const filetypes = new RegExp(`\\.(${allowedTypes.join('|')})$`, 'i');
  const mimetype = new RegExp(`^image/(${allowedTypes.join('|')})|application/pdf$`);

  const isExtValid = filetypes.test(path.extname(file.originalname));
  const isMimeValid = mimetype.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  } else {
    cb(new Error(`Error: Please upload a valid file type (${allowedTypes.join(', ')})`));
  }
}

// Multer for CSV/JSON uploads
export const uploadCsv = multer({
    storage: multer.memoryStorage(),
    fileFilter(req, file, cb) { checkFileType(file, cb, ['csv']); }
}).single('file');

export const uploadJson = multer({
    storage: multer.memoryStorage(),
    fileFilter(req, file, cb) { checkFileType(file, cb, ['json']); }
}).single('file');