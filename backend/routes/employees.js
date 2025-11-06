const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');

// Get admin dashboard stats
router.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get stats
    const allUsers = await User.find({});
    const totalCustomers = allUsers.filter(u => u.role === 'customer').length;
    console.log('Filtered customers:', totalCustomers);
    const pendingPayments = await Transaction.countDocuments({ status: 'pending' });
    
    // Verified today (completed today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const verifiedToday = await Transaction.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfDay }
    });
    
    // Total volume (sum of completed transactions)
    const totalVolumeResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = totalVolumeResult.length > 0 ? totalVolumeResult[0].total : 0;

    res.json({
      totalCustomers,
      pendingPayments,
      verifiedToday,
      totalVolume
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent activities
router.get('/admin/activities', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find({})
      .populate('user', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    const activities = recentTransactions.map(txn => {
      let action = 'Payment Submitted';
      if (txn.status === 'completed') action = 'Payment Verified';
      else if (txn.status === 'failed') action = 'Payment Rejected';
      else if (txn.status === 'processing') action = 'Payment Processing';

      const customer = txn.user ? `${txn.user.name} (****${txn.accountNumber ? txn.accountNumber.slice(-4) : '****'})` : 'Unknown';
      const amount = `R${txn.amount.toFixed(2)}`;
      const time = txn.updatedAt.toLocaleString();

      return {
        id: txn._id,
        action,
        customer,
        amount,
        time,
        status: txn.status === 'completed' ? 'completed' : txn.status === 'failed' ? 'error' : 'pending'
      };
    });

    res.json({ activities });
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all customers
router.get('/admin/customers', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all customers
    const allUsers = await User.find({});
    const customers = allUsers.filter(u => u.role === 'customer');

    const customerData = await Promise.all(customers.map(async (cust) => {
      const decrypted = cust.getDecryptedData();
      
      // Get last transaction
      const lastTxn = await Transaction.findOne({ user: cust._id }).sort({ updatedAt: -1 });
      
      return {
        id: cust._id,
        name: decrypted.name,
        accountNumber: decrypted.accountNumber,
        email: decrypted.email,
        phone: '', // Placeholder
        balance: 0, // Placeholder
        status: 'Active', // Placeholder
        joinDate: cust.createdAt ? cust.createdAt.toISOString().split('T')[0] : 'N/A',
        lastTransaction: lastTxn && lastTxn.updatedAt ? lastTxn.updatedAt.toISOString().split('T')[0] : 'N/A',
      };
    }));

    res.json({ customers: customerData });
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;