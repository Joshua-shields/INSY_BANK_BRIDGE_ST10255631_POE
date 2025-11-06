const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database:\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  Role:', user.role);
      console.log('  Raw accountNumber (encrypted):', user.accountNumber);
      console.log('  Raw email (encrypted):', user.email);
      
      try {
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

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
