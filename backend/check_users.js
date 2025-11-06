// Script to check and display all users in the database
// Displays user roles, encrypted fields, decrypted data, and account lock status
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Main function to retrieve and display user information
async function checkUsers() {
  try {
    // Connect to MongoDB using the connection string 
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Retrieve all users from the database
    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database:\n`);

    // loop through each user and display their information
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  Role:', user.role);
      console.log('  Raw accountNumber (encrypted):', user.accountNumber);
      console.log('  Raw email (encrypted):', user.email);

      try {
        //  decrypt the user data
        const decrypted = user.getDecryptedData();
        console.log('  Decrypted data:');
        console.log('    Name:', decrypted.name);
        console.log('    Account Number:', decrypted.accountNumber);
        console.log('    Email:', decrypted.email);
        console.log('    ID Number:', decrypted.idNumber);
      } catch (err) {
        console.log('  Error decrypting:', err.message);
      }
      console.log('  Login Attempts:', user.loginAttempts);
      console.log('  Is Locked:', user.isLocked);
      console.log('  Lock Until:', user.lockUntil);
      console.log('---');
    });

    // Close the  connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Execute the checkUsers function
checkUsers();
