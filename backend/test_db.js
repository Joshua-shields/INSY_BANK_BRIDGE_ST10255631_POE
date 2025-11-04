require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

async function testDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test user creation
    console.log('🔄 Testing user creation...');
    const uniqueId = Date.now().toString().slice(-13); // Generate unique 13-digit ID
    const testUser = new User({
      name: 'Test User',
      idNumber: uniqueId,
      password: 'hashedpassword',
      accountNumber: '1234567890123456',
      email: `test${Date.now()}@example.com`
    });

    await testUser.save();
    console.log('✅ User saved successfully');

    // Test transaction creation
    console.log('🔄 Testing transaction creation...');
    const testTransaction = new Transaction({
      amount: 100.50,
      recipientAccount: '9876543210987654',
      recipientName: 'Recipient User',
      senderAccount: testUser.accountNumber,
      swiftCode: 'TESTSWFT',
      reference: 'Test international transfer',
      userId: testUser._id,
      status: 'pending'
    });

    await testTransaction.save();
    console.log('✅ Transaction saved successfully with SWIFT code');

    // Test retrieval
    console.log('🔄 Testing data retrieval...');
    const users = await User.find({}).limit(5);
    const transactions = await Transaction.find({}).limit(5);

    console.log(`✅ Found ${users.length} users and ${transactions.length} transactions`);

    // Clean up test data
    console.log('🔄 Cleaning up test data...');
    await Transaction.deleteMany({ reference: 'Test international transfer' });
    await User.deleteMany({ name: 'Test User' });
    console.log('✅ Test data cleaned up');

    console.log('🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testDatabase();