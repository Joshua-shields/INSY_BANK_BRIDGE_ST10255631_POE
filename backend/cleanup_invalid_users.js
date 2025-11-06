const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function cleanupInvalidUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    let deletedCount = 0;

    for (const user of users) {
      try {
        const decrypted = user.getDecryptedData();
        
        // Check if customer has undefined/null account number
        if (user.role === 'customer' && !decrypted.accountNumber) {
          console.log(`Deleting invalid user: ${decrypted.email || 'Unknown'} (no account number)`);
          await User.deleteOne({ _id: user._id });
          deletedCount++;
        }
      } catch (err) {
        console.log(`Error processing user ${user._id}:`, err.message);
      }
    }

    console.log(`\nDeleted ${deletedCount} invalid user(s)`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupInvalidUsers();
