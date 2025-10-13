//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const mongoose = require('mongoose');

// Shared Transaction schema for both Local and International transfers
// this is to reduce code duplications 
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 // 
  transactionType: {
    type: String,
    enum: ['local', 'international'],// only the local and international will be aallowed 
    default: 'international'
  },
  name: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty for local transactions
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name must contain only letters and spaces' // error message
    }
  },
  accountHolderName: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty 
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Account holder name must contain only letters and spaces' // error message
    }
  },
  // Recipient name for local transactions
  recipientName: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty for international
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Recipient name must contain only letters and spaces'
    }
  },
  accountNumber: {
    type: String 
  },
  bank: {
    type: String,
    required: true
  },
  swiftCode: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  immediatePayment: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// frequently queried fields

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionType: 1 });

// Export the Transaction model (handles both local and international)
module.exports = mongoose.model('Transaction', transactionSchema);
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////