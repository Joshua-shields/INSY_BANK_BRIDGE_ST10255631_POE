//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// JWT authentication configuration - for auth
const JWT_SECRET = process.env.JWT_SECRET || 'bank-bridge-secret-key-2024';

// rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' }
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour  
  max: 3, // limit each IP to 3 registration attempts per hour
  message: { error: 'Too many registration attempts, please try again later' }
});

// Rate limiting for password reset
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 forgot password attempts per 15 minutes
  message: { error: 'Too many password reset attempts, please try again later' }
});

// Generate JWT token
// expires in 1 hour
// this system will contain userId and accountNumber
const generateToken = (userId, accountNumber) => {
  return jwt.sign(
    { userId, accountNumber },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // if no token provided access is denied
  // 401 error message shall display should no token be provided
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  // try to verify token and get user info else invalid token
  // 400 error message shall display should the token be invalid or not present 
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Export middleware functions
// for use in routes
module.exports = {
  loginLimiter,
  registerLimiter, 
  forgotPasswordLimiter,
  generateToken,
  verifyToken
};
////////////////////////////////////////  end of file ////////////////////////////////////////