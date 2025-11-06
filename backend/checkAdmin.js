// This script checks for the existence of an admin user in the database.
// It connects to MongoDB, queries for an admin user, and logs the result.

// Import required modules
const mongoose = require('mongoose'); // MongoDB ODM for Node.js
const User = require('./models/User'); // User model for database operations
require('dotenv').config(); // Load environment variables from .env file

// Function to check if an admin user exists in the database
async function checkAdmin() {
  try {
    // Connect to MongoDB using the URI from environment variables or default local URI
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bank_bridge');
    // Find the first user with role 'admin'
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      // Log the decrypted admin data if found
      console.log('Admin user exists:', admin.getDecryptedData());
    } else {
      // Log if no admin user is found
      console.log('Admin user not found');
    }
  } catch (error) {
    // Log any errors that occur during the process
    console.error('Error:', error);
  } finally {
    // Ensure the database connection is closed
    await mongoose.connection.close();
  }
}

// Execute the checkAdmin function
checkAdmin();