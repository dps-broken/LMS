import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const generateToken = (res, userId, userRole) => {
  // Explicitly convert the userId to a string before signing
  const payload = { id: userId.toString(), role: userRole };
  
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  return token;
};

export default generateToken;