//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
// Load environment variables and required packages
//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
require('dotenv').config({ quiet: true });
const express = require('express'); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const slowDown = require('express-slow-down');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Call the models and middleware
// this includes user model and validation middleware
const User = require('./models/User');
const { validateRegistration, validateLogin, validateForgotPassword, validateForgotUsername } = require('./middleware/validation');
const { loginLimiter, registerLimiter, forgotPasswordLimiter, generateToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const employeesRoutes = require('./routes/employees');

// express app
const app = express(); // create express app

// Custom MongoDB sanitization middleware to prevent NoSQL injection
// this is to ensure that no malicious code is injected into the database queries
const mongoSanitize = (req, res, next) => {
  const sanitizeObj = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObj(obj[key]);
        } else if (typeof obj[key] === 'string') {
          // Remove MongoDB operators like $ne, $gt, etc.
          obj[key] = obj[key].replace(/^\$/, '_');
        }
      }
    }
  };
  
  if (req.body) sanitizeObj(req.body);
  if (req.query) sanitizeObj(req.query);
  if (req.params) sanitizeObj(req.params);
  
  next();
};

// Security middleware configuration
// this includes cors, helmet, rate limiting, csrf protection, and data sanitization
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8000', 'http://localhost:8001', 'https://localhost:3000', 'https://localhost:3001', 'https://localhost:8000', 'https://localhost:8001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token']
})); // Allow cross-origin requests with specific origins
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
})); // use node.js helmet as it has built in security headers
app.use(express.json({ limit: '10kb' })); // Limit request size to prevent payload attacks
app.use(cookieParser()); // Parse cookies before CSRF middleware
app.use(mongoSanitize); // NoSQL injection prevention

// Enhanced DDoS protection with progressive delays
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skipSuccessfulRequests: false, // Don't skip successful requests
  skipFailedRequests: false, // Don't skip failed requests
});

app.use(speedLimiter); // Apply global speed limiting for DDoS protection

// CSRF protection configured for auth routes only
// JWT-protected routes don't need CSRF since tokens are in Authorization headers
const csrfProtection = csrf({ 
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true,
    secure: false, // Changed to false for HTTP
    sameSite: 'lax' // Changed from 'none' to 'lax' for HTTP
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    return req.headers['x-csrf-token'] || 
           req.headers['x-xsrf-token'] || 
           req.body._csrf ||
           req.query._csrf;
  }
});

// Endpoint to provide CSRF token for auth routes
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Use auth routes
app.use('/', authRoutes);

// Use employee routes
app.use('/api', employeesRoutes);

// Password validation with security requirements
// used to ensure strong passwords
function validatePassword(password) {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain lowercase letter' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase letter' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain a number' };
  if (!/[!@#$%^&*]/.test(password)) return { valid: false, message: 'Password must contain special character' };
  return { valid: true };
}

// User registration endpoint with comprehensive security
// how this works is we validate input, hash password, and store user
app.post('/register', registerLimiter, validateRegistration, csrfProtection, async (req, res) => {
  const { name, idNumber, password, confirmPassword, accountNumber, email } = req.body;
  
  try {
    // Check password confirmation
    // this is to ensure the user has correctly entered their desired password
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    // Validate password strength
    // this is to ensure strong passwords are used
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Check if user already exists by searching all users and decrypting
    // this is to prevent duplicate accounts
    const { encrypt } = require('./utils/encryption');
    const allUsers = await User.find({});
    const existingUser = allUsers.find(user => {
      const { decrypt } = require('./utils/encryption');
      try {
        return decrypt(user.idNumber) === idNumber || decrypt(user.accountNumber) === accountNumber;
      } catch (e) {
        return false;
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password with salt how this works is bcrypt adds salt and hashes
    // this is to securely store passwords
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    // encrypt sensitive fields before saving
    // this is to protect sensitive user data
    const user = new User({ 
      name, 
      idNumber, 
      password: hashedPassword, 
      accountNumber,
      email
    });
    
    await user.save();
    
    // Respond with success message (return decrypted accountNumber for display)
    // this is to confirm successful registration
    const decryptedData = user.getDecryptedData();
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { name: user.name, accountNumber: decryptedData.accountNumber }
    });
    
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Server error' }); // simple server error message
    }
  }
});

// User authentication endpoint with security controls
// how this works is we check credentials, handle lockout, and generate token
app.post('/login', loginLimiter, validateLogin, csrfProtection, async (req, res) => {
  const { username, accountNumber, password } = req.body;
  
  try {
    // Find user by decrypting all accountNumbers
    // this is to securely find the user
    // we decrypt each account number to compare with input
    // this prevents storing plain text account numbers
    const { decrypt } = require('./utils/encryption');
    const allUsers = await User.find({});
    const user = allUsers.find(u => {
      try {
        return decrypt(u.accountNumber) === accountNumber;
      } catch (e) {
        return false;
      }
    });
    
    // If user not found
    // this is to prevent unauthorized access
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' }); // error message 
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account is locked due to too many failed attempts' // error message for lock account 
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' }); // error message for invalid credentials 
    }
    
    // Successful login - reset attempts and generate token
    await user.resetLoginAttempts();
    const decryptedData = user.getDecryptedData();
    const token = generateToken(user._id, decryptedData.accountNumber);
    
    res.json({ 
      message: 'Login successful', 
      user: { 
        name: user.name, 
        accountNumber: decryptedData.accountNumber
      },
      token
    });
    
    // Log login event
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password endpoint with security controls
app.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, csrfProtection, async (req, res) => {
  const { accountNumber, idNumber, password, confirmPassword } = req.body;
  
  try {
    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Find user by account number AND ID number for security (decrypt to compare)
    const { decrypt } = require('./utils/encryption');
    const allUsers = await User.find({});
    const user = allUsers.find(u => {
      try {
        return decrypt(u.accountNumber) === accountNumber.trim().replace(/[^0-9]/g, '') && 
               decrypt(u.idNumber) === idNumber.trim().replace(/[^0-9]/g, '');
      } catch (e) {
        return false;
      }
    });
    // If user not found
    if (!user) {
      return res.status(404).json({ error: 'Account not found or credentials do not match' }); // error message
    }
    
    // Check if new password is the same as old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'Please use a new password. You cannot reuse your current password.' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and reset any lockouts
    await User.updateOne(
      { _id: user._id },
      { 
        password: hashedPassword,
        $unset: { loginAttempts: 1, lockUntil: 1 }
      }
    );
    // Respond with success message
    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot username endpoint
app.post('/forgot-username', forgotPasswordLimiter, validateForgotUsername, csrfProtection, async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find user by email (decrypt to compare)
    const { decrypt } = require('./utils/encryption');
    const allUsers = await User.find({});
    const user = allUsers.find(u => {
      try {
        return decrypt(u.email) === email.trim().toLowerCase();
      } catch (e) {
        return false;
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }
    
    // Return partial account number for security
    const decryptedAccountNumber = decrypt(user.accountNumber);
    const maskedAccountNumber = decryptedAccountNumber.slice(0, 2) + '******';
    
    res.json({ 
      message: 'Account found',
      accountNumber: maskedAccountNumber,
      name: user.name,
      note: 'Please contact the bank if you cannot get into your account'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// MFA routes - protected by JWT, no CSRF needed
app.post('/api/mfa/setup', async (req, res) => {
  try {
    const { accountNumber } = req.body;
    
    if (!accountNumber) {
      return res.status(400).json({ error: 'Account number is required' });
    }
    
    const { decrypt } = require('./utils/encryption'); // decrypt function
    const allUsers = await User.find({});
    
    const user = allUsers.find(u => {
      try {
        return decrypt(u.accountNumber) === accountNumber; // compare decrypted account number
      } catch (e) {
        return false;
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' }); // error message
    }
    
    const decryptedAccountNumber = decrypt(user.accountNumber);
    
    if (!user.mfaSecret) {
      const secret = speakeasy.generateSecret({
        name: `BankBridge (${decryptedAccountNumber})`,
        issuer: 'BankBridge'
      });
      
      await User.updateOne({ _id: user._id }, { $set: { mfaSecret: secret.base32 } });
      user.mfaSecret = secret.base32;
    }
    
    const qrCodeUrl = await qrcode.toDataURL(`otpauth://totp/BankBridge(${decryptedAccountNumber})?secret=${user.mfaSecret}&issuer=BankBridge`);
    // Return whether MFA is already set up along with QR code and secret for setup
    res.json({
      alreadySetup: user.mfaEnabled, // indicate if MFA is already enabled
      mfaEnabled: user.mfaEnabled,
      requiresOTP: true,
      secret: user.mfaSecret,
      qrCode: user.mfaEnabled ? null : qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// MFA verification endpoint

app.post('/api/mfa/verify', async (req, res) => {
  try {
    const { accountNumber, token } = req.body;
    
    // Find user by decrypting accountNumber
    const { decrypt } = require('./utils/encryption');
    const allUsers = await User.find({});
    const user = allUsers.find(u => {
      try {
        return decrypt(u.accountNumber) === accountNumber;
      } catch (e) {
        return false;
      }
    });
    // If user not found or no MFA secret
    if (!user || !user.mfaSecret) {
      return res.status(404).json({ error: 'MFA not set up' });
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret, 
      encoding: 'base32',
      token: token,
      window: 2
    });
    // If verified, enable MFA
    if (verified) {
      user.mfaEnabled = true;
      await user.save(); // save the updated user
      res.json({ success: true, message: 'MFA verified successfully' }); // success message
    } else {
      res.status(400).json({ error: 'Invalid OTP code' }); // error message
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // server error message
  }
});

// Logout endpoint - clears client-side token
app.post('/logout', (req, res) => {
  // Since we're using JWT (stateless), we just return success
  // The client will clear the localStorage token
  res.json({ message: 'Logged out successfully' });
});

// Example protected route to get user info - for testing purposes
// this route is protected by JWT and returns user info without sensitive data
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password -loginAttempts -lockUntil').limit(10);
    const decryptedUsers = users.map(user => ({
      ...user.toObject(),
      ...user.getDecryptedData() // merge decrypted fields
    }));
    res.json(decryptedUsers); // return users without sensitive info
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // server error message
  }
});

// Payment routes - protected by JWT, no CSRF needed
const paymentRoutes = require('./routes/payments'); 
app.use('/api', paymentRoutes);

// SSL options for HTTPS server
const sslDir = path.join(__dirname, '..', 'ssl'); // directory for SSL certificates
const certPath = path.join(sslDir, 'cert.pem'); // certificate path
const keyPath = path.join(sslDir, 'key.pem'); // key path
// Generate self-signed certs if not present
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('SSL certificates not found. Generating...');
  const { execSync } = require('child_process');
  try {
    execSync('node generate-cert.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' }); // run cert generation script
  } catch (err) {
    console.error('Failed to generate SSL certificates:', err.message);
    process.exit(1);
  }
}
// Read SSL certs
const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Function to ensure admin user exists
async function ensureAdminExists() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const admin = new User({
        accountNumber: '10111026372637',
        email: 'bankbridge@admin.com',
        password: 'secure-admin-password',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
  }
}

// MongoDB connection and server startup
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bank_bridge')
  .then(async () => {
    await ensureAdminExists();
    // Always use HTTP for simplicity (no TLS errors)
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  })
  .catch(err => {
    process.exit(1); // exit on DB connection error
  });
}

// Export app for testing
module.exports = app;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////
