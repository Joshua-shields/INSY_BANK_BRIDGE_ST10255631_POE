//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

// User schema definition for mongodb how this works is we define the structure of user data
// this includes fields such as  name, id Number, password, account Number, email, and security features
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  idNumber: { 
    type: String, 
    required: true, 
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
  email: { 
    type: String, 
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); // basic email format validation
      },
      message: 'Please enter a valid email address'  // error message
    }
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

// Method to get decrypted fields
userSchema.methods.getDecryptedData = function() {
  return {
    _id: this._id,
    name: this.name,
    idNumber: decrypt(this.idNumber),
    accountNumber: decrypt(this.accountNumber),
    email: decrypt(this.email),
    mfaEnabled: this.mfaEnabled,
    loginAttempts: this.loginAttempts,
    lockUntil: this.lockUntil
  };
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
////////////////////////////////////////  end of file ////////////////////////////////////////