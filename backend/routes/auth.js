//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, loginLimiter, registerLimiter, forgotPasswordLimiter } = require('../middleware/auth');

const router = express.Router();

// Employee login route
router.post('/employee/login', [
  loginLimiter,
  body('email').isEmail().normalizeEmail(),
  body('accountNumber').isLength({ min: 10, max: 16 }).isNumeric(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { email, accountNumber, password } = req.body;

    // Find admin user
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Decrypt and verify both email and account number
    const decryptedData = user.getDecryptedData();
    if (decryptedData.email.toLowerCase() !== email.toLowerCase() || decryptedData.accountNumber !== accountNumber) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ error: 'Account is temporarily locked due to too many failed login attempts' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate token
    const decryptedUser = user.getDecryptedData();
    const token = generateToken(user._id, decryptedUser.accountNumber);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: decryptedUser.name,
        email: decryptedUser.email,
        role: decryptedUser.role
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer login route
router.post('/login', [
  loginLimiter,
  body('accountNumber').isLength({ min: 10, max: 16 }).isNumeric(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { accountNumber, password } = req.body;

    // Find all customer users and search for matching account number
    // (account numbers are encrypted, so we need to decrypt to compare)
    const users = await User.find({ role: 'customer' });
    const user = users.find(u => {
      try {
        const decrypted = u.getDecryptedData();
        return decrypted.accountNumber === accountNumber;
      } catch (err) {
        return false;
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid account number or password' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ error: 'Account is temporarily locked due to too many failed login attempts' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid account number or password' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate token
    const decryptedUser = user.getDecryptedData();
    const token = generateToken(user._id, decryptedUser.accountNumber);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: decryptedUser.name,
        accountNumber: decryptedUser.accountNumber,
        email: decryptedUser.email
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer registration route
router.post('/register', [
  registerLimiter,
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('idNumber').isLength({ min: 13, max: 13 }),
  body('accountNumber').isLength({ min: 10, max: 16 }).isNumeric(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { name, idNumber, accountNumber, email, password } = req.body;

    // Check if user already exists (need to decrypt to compare)
    const allUsers = await User.find({});
    const existingUser = allUsers.find(u => {
      try {
        const decrypted = u.getDecryptedData();
        return decrypted.email?.toLowerCase() === email.toLowerCase() ||
               decrypted.accountNumber === accountNumber ||
               decrypted.idNumber === idNumber;
      } catch (err) {
        return false;
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email, account number, or ID number already exists' });
    }

    // Create new user
    const user = new User({
      name,
      idNumber,
      accountNumber,
      email,
      password,
      role: 'customer'
    });

    await user.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
//////////////////////////////////////  end of file ////////////////////////////////////////