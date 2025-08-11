import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import config from '../config/index.js';

const protect = asyncHandler(async (req, res, next) => {
    console.log('\n\n--- PROTECT MIDDLEWARE TRIGGERED ---');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('1. Token found in header:', token);

            // --- CRITICAL DEBUGGING LOG ---
            // Let's see the EXACT secret being used for verification.
            const secret = config.jwt.secret;
            if (!secret) {
                console.error('CRITICAL ERROR: JWT_SECRET is NOT loaded! Check your .env file.');
                throw new Error('Server configuration error: JWT secret is missing.');
            }
            console.log('2. Verifying token with secret:', `"${secret}"`);
            // -----------------------------

            const decoded = jwt.verify(token, secret);
            console.log('3. Token decoded successfully. Payload:', decoded);

            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                console.log('4. User found in DB:', user.email);
                req.user = user;
                console.log('5. SUCCESS: Attaching user to request and proceeding.');
                return next();
            } else {
                console.error('4. FAIL: User ID from token not found in DB.');
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
        } catch (error) {
            console.error('4. FAIL: Token verification threw an error.');
            console.error('--> Error Message:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    console.log('FAIL: No "Bearer" token in Authorization header.');
    res.status(401);
    throw new Error('Not authorized, no token');
});

// ... (admin and student middleware remain the same) ...
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else { res.status(401); throw new Error('Not authorized as an admin'); }
};
const student = (req, res, next) => {
  if (req.user && req.user.role === 'student') next();
  else { res.status(401); throw new Error('Not authorized as a student'); }
};

export { protect, admin, student };