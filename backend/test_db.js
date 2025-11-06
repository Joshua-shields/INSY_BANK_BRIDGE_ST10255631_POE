
//------------------------------------------ start of file ----------------------------------------//
 ///  Test script for database operations using Mongoose.
  /// This script connects to MongoDB on User and Transaction models,
///   and cleans up test data afterward.
 

// Load environment variables 
require('dotenv').config();

// Import Mongoose 
const mongoose = require('mongoose');

// Import User and Transaction models 
const User = require('./models/User');
const Transaction = require('./models/Transaction');

/**
 * 
 * 
 * Main function to test database connectivity and operation 
 * 
 * Performs user creation, transaction creation, data retrieval, and cleanup.
 * 
 * 
 * 
 */
async function testDatabase() {
  try {
    // Attempt to connect to MongoDB using the URI 
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    //  Test user creation
    console.log('🔄 Testing user creation...');
    //  unique 13-digit ID using the current timestamp
    const uniqueId = Date.now().toString().slice(-13); // Generate unique 13-digit ID
    // Create a new User instance with test data
    const testUser = new User({
      name: 'Test User',
      idNumber: uniqueId, // Unique ID for the user
      password: 'hashedpassword', // Placeholder hashed password
      accountNumber: '1234567890123456', // Test account number
      email: `test${Date.now()}@example.com` // Unique email using timestamp
    });

    await testUser.save();
    console.log('✅ User saved successfully');

    //  Test transaction creation
    console.log('🔄 Testing transaction creation...');
    //  new Transaction instance linked to the test user
    const testTransaction = new Transaction({
      amount: 100.50, // Transaction amount
      recipientAccount: '9876543210987654', // Recipient's account number
      recipientName: 'Recipient User', // Recipient's name
      senderAccount: testUser.accountNumber, // Sender's account from test user
      swiftCode: 'TESTSWFT', // SWIFT code for international transfer
      reference: 'Test international transfer', // Transaction reference
      userId: testUser._id, // Reference to the user who initiated the transaction
      status: 'pending' // Initial status of the transaction
    });

    await testTransaction.save();
    console.log('✅ Transaction saved successfully with SWIFT code');

    //  Test data retrieval
    console.log('🔄 Testing data retrieval...');
    //  5 users and transactions from the database
    const users = await User.find({}).limit(5);
    const transactions = await Transaction.find({}).limit(5);

    console.log(`✅ Found ${users.length} users and ${transactions.length} transactions`);

    // Section: Clean up data
    console.log('🔄 Cleaning up test data...');
    // Delete the test transaction and user to nnot fill the databse 
    await Transaction.deleteMany({ reference: 'Test international transfer' });
    await User.deleteMany({ name: 'Test User' });
    console.log('✅ Test data cleaned up');

    console.log('🎉 All database tests passed!');

  } catch (error) {
    // Handle any errors that occur during the test
    console.error('❌ Database test failed:', error.message);
  } finally {
    // Ensure the database connection is closed regardless of success or failure
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Execute the test function
testDatabase();

///---------------------------------------------------- end of file ----------------------------------------//