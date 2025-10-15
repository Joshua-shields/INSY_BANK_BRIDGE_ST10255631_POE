//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utils/encryption');

// User schema definition for mongodb how this works is we define the structure of user data
// this includes fields such as  name, id Number, password, account Number, email, and security features
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: function() { return this.role !== 'admin'; },
    trim: true
  },
  idNumber: { 
    type: String, 
    required: function() { return this.role !== 'admin'; }, 
    unique: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  accountNumber: { 
    type: String, 
    required: true, 
    unique: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  // Security fields for account protection 
  // to prevent brute force attacks and unauthorized access
  // this includes login attempts tracking and multi-factor authentication (MFA) settings
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  mfaSecret: {
    type: String
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check if account is locked how this works is if lockUntil is set and in the future
// this means the account is currently locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now()); 
});

// Method to increment login attempts how this works is if attempts exceed 5 lock account for 15 minutes
userSchema.methods.incLoginAttempts = function() {
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 15 minutes
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
  }
  // Apply updates to user document
  return this.updateOne(updates);
};

// Reset login attempts on successful login
// this clears the login attempts and lockUntil fields
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Encrypt sensitive fields before saving
// this includes id Number, account Number, and email
userSchema.pre('save', function(next) {
  if (this.isModified('idNumber') && this.idNumber && !this.idNumber.includes(':')) {
    this.idNumber = encrypt(this.idNumber);
  }
  if (this.isModified('accountNumber') && this.accountNumber && !this.accountNumber.includes(':')) {
    this.accountNumber = encrypt(this.accountNumber);
  }
  if (this.isModified('email') && this.email && !this.email.includes(':')) {
    this.email = encrypt(this.email);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.getDecryptedData = function() {
  return {
    _id: this._id,
    name: this.name || 'Admin',
    idNumber: this.idNumber ? decrypt(this.idNumber) : null,
    accountNumber: decrypt(this.accountNumber),
    email: decrypt(this.email),
    role: this.role,
    mfaEnabled: this.mfaEnabled,
    loginAttempts: this.loginAttempts,
    lockUntil: this.lockUntil
  };
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
////////////////////////////////////////  end of file ////////////////////////////////////////