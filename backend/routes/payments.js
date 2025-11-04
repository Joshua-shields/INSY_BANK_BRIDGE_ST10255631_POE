//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
const express = require('express'); // import express framework
const router = express.Router();
const Transaction = require('../models/Transaction'); // import transacctions 
const User = require('../models/User'); // import user 
const jwt = require('jsonwebtoken'); // import jsonwebtoken for token handling
const speakeasy = require('speakeasy'); // import speakeasy for the multifactor auth (otp code to be sent to user)
const { encrypt } = require('../utils/encryption'); // encryption for the sensitive data 

// Middleware to verify jasom web  token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // get token from  the header
  if (!token) return res.status(401).json({ error: 'No token provided' }); // if no token provided acess is denied and user will get the 401 eroror 
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bank-bridge-secret-key-2024');
    req.userId = decoded.userId;
    req.accountNumber = decoded.accountNumber; //
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
///////////////////////////////////////////////////////////////////END OF VARIABLES//////////////////////////////////////////////////////////////

router.post('/customer/payments', verifyToken, async (req, res) => {
  try {
    const { recipientAccount, recipientName, amount, swiftCode, reference } = req.body;
    
    // Validate amount
    // must be a number
    // must be more than 0 
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Get decrypted account number
    const decryptedData = user.getDecryptedData();
    
    // Create transaction
    const transaction = new Transaction({
      user: req.userId,  // Changed from userId to user to match Transaction schema
      transactionType: 'international',
      accountHolderName: recipientName,
      recipientName: recipientName,
      accountNumber: recipientAccount,
      bank: 'Standard Bank',  // Default bank
      swiftCode: swiftCode,
      amount: parseFloat(amount),
      senderAccount: decryptedData.accountNumber,
      reference: reference,
      status: 'pending'
    });
    
    await transaction.save();
    // Respond with success message and the details for the transaction 
    res.status(201).json({ 
      message: 'Payment submitted successfully', // success message
      transaction: {
        id: transaction._id, 
        amount: transaction.amount,
        recipientName: transaction.recipientName,
        status: transaction.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // server error message
  }
});
// Get all transactions for the logged-in user
router.get('/customer/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ transactions });
  } catch (error) { 
    res.status(500).json({ error: 'Server error' }); // server error message
  }
});
 // Get payment details by ID for the login user
router.get('/customer/payments/:id', verifyToken, async (req, res) => {
  try {
    const paymentId = req.params.id.toString();
    
    const transaction = await Transaction.findOne({ 
      _id: paymentId, 
      userId: req.userId 
    });
    
    if (!transaction) return res.status(404).json({ error: 'Payment not found' }); // payment not found error message
    
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // server error message
  }
});

// Local transactions endpoint 
// this is for local bank transfers
// this will require mfa verification

router.post('/payments/local-transfer', verifyToken, async (req, res) => {
  try {
    const { recipientName, amount, bank, name, otpToken, date } = req.body;
    
    //Input validation
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
     // Amount must be more than 0
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    
    // Name validation check
    if (!recipientName || !recipientName.trim()) {
      return res.status(400).json({ error: 'Recipient name is required' });
    }
    // Name must contain only letters and spaces
    if (!/^[A-Za-z\s]+$/.test(recipientName)) {
      return res.status(400).json({ error: 'Recipient name must contain only letters and spaces' });
    }
    // Bank validation check
    if (!bank) {
      return res.status(400).json({ error: 'Bank is required' });
    }
    // Valid bank selection 
    // these are our whitelisted banks and the ones chosen for this application
    // prevents fake banks from being used etc 
    const validBanks = ['Absa', 'FNB', 'Standard Bank', 'Nedbank', 'Capitec Bank', 'Investec', 'Discovery Bank', 'African Bank', 'Bidvest Bank', 'TymeBank'];
    if (!validBanks.includes(bank)) {
      return res.status(400).json({ error: 'Invalid bank selection' });
    }
    // Get user from database by using the users id to get the information  
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' }); // user not found error message which is based off the use r ID 
    
    // MFA verification for local transactions
    if (user.mfaSecret) {
      if (!otpToken) {
        return res.status(400).json({ error: 'OTP token required' }); // otp token required error message IF the otp cant be found 
      } 
      
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: otpToken,
        window: 2
      });
      // if otp code is invalid the user will get the invalid otp code error message
      if (!verified) {
        return res.status(401).json({ error: 'Invalid OTP code' });
      }
      // Enable MFA if not already enabled
      if (!user.mfaEnabled) {
        await User.updateOne({ _id: user._id }, { $set: { mfaEnabled: true } });
      }
    }
    


    // Create local transaction using shared Transaction model
    // Local transactions have a unique account number format to choose between the internaational and the local 
    const transaction = new Transaction({
      user: req.userId,
      transactionType: 'local',
      recipientName: recipientName,
      accountNumber: encrypt(`LOCAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`), // 
      bank: encrypt(bank),
      swiftCode: 'LOCAL',
      amount: parseFloat(amount),
      transactionDate: date ? new Date(date) : new Date(),
      status: 'pending'
    });
    
    await transaction.save();
    // Respond with success message and transaction details
    res.status(201).json({ 
      message: 'Local transfer submitted successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        recipientName: transaction.recipientName,
        bank: transaction.bank,
        status: transaction.status,
        transactionDate: transaction.transactionDate,
        transactionType: transaction.transactionType
      }
    });
    } catch (error) {
    res.status(500).json({ 
      error: 'Server error'
    });
  }
});

// International transactions endpoint 
// this is for international bank transfers
// this will require mfa verification
// this will also require swift code for the bank
router.post('/payments/transfer', verifyToken, async (req, res) => {
  try {
    const { recipientAccount, recipientName, amount, swiftCode, bank, name, otpToken, immediatePayment } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' }); // amount must be a number
    }
    
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' }); // amount must be beeger  than 0
    }
    
    if (!recipientName || !recipientName.trim()) {
      return res.status(400).json({ error: 'Recipient name is required' }); // recipient name is needed 
    }
    
    if (!/^[A-Za-z\s]+$/.test(recipientName)) {
      return res.status(400).json({ error: 'Recipient name must contain only letters and spaces' }); // recipient name must contain only letters 
    }
    
    if (!recipientAccount || !recipientAccount.trim()) {
      return res.status(400).json({ error: 'Recipient account number is required' }); //""
    }
    
    if (!/^[0-9]{10,16}$/.test(recipientAccount)) {
      return res.status(400).json({ error: 'Account number must be 10-16 digits' }); // 
    }
    
    if (!swiftCode || !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode)) {
      return res.status(400).json({ error: 'Valid SWIFT code is required' });
    }
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.mfaSecret) {
      if (!otpToken) {
        return res.status(400).json({ error: 'OTP token required' });
      }
      
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: otpToken,
        window: 2
      });
      
      if (!verified) {
        return res.status(401).json({ error: 'Invalid OTP code' });
      }
      
      if (!user.mfaEnabled) {
        await User.updateOne({ _id: user._id }, { $set: { mfaEnabled: true } });
      }
    }
    // Create international transaction using shared Transaction 
    const transaction = new Transaction({
      user: req.userId,
      transactionType: 'international',
      name: name || user.name,
      accountHolderName: recipientName,
      accountNumber: encrypt(recipientAccount),
      bank: encrypt(bank || 'Standard Bank'),
      swiftCode: encrypt(swiftCode),
      amount: parseFloat(amount),
      immediatePayment: immediatePayment || false,
      status: 'pending'
    });
    
    await transaction.save();
    // Respond with success message 
    res.status(201).json({ 
      message: 'Transfer submitted successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        recipientName: transaction.accountHolderName,
        status: transaction.status,
        transactionType: transaction.transactionType
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error'
    });
  }
});
// Employee routes for payment verifications
router.get('/employee/payments/pending', async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .populate('user', 'name accountNumber')
      .sort({ createdAt: -1 });
    
    const decryptedTransactions = transactions.map(txn => {
      const txnObj = txn.toObject();
      if (txnObj.user && txnObj.user.accountNumber) {
        const decryptedData = txn.user.getDecryptedData(); // Decrypt user data
        txnObj.user.accountNumber = decryptedData.accountNumber;
      }
      return txnObj;
    });
    
    res.json({ transactions: decryptedTransactions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
 // Verify or reject a payment
router.put('/employee/payments/:id/verify', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' }); // invalid status error message
    }
    // Update transaction status
    // this is based on the ID of the transaction 
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: status === 'verified' ? 'completed' : 'failed' },
      { new: true }
    );
    
    if (!transaction) return res.status(404).json({ error: 'Payment not found' });
    // Respond with success message and updated transaction details
    res.json({ 
      message: `Payment ${status} successfully`,
      transaction 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Deny a payment endpoint
router.put('/employee/payments/:id/deny', async (req, res) => {
  try {
    const { note } = req.body;
    
    // Update transaction status to denied/failed
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'failed',
        verificationNote: note || 'Payment denied by admin'
      },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Log the denial for audit purposes
    console.log(`Payment ${req.params.id} denied. Note: ${note || 'No note provided'}`);
    
    // Respond with success message
    res.json({ 
      message: 'Payment denied successfully',
      transaction: {
        id: transaction._id,
        status: transaction.status,
        verificationNote: note
      }
    });
  } catch (error) {
    console.error('Error denying payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; // export the router to be used in the main app
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////
