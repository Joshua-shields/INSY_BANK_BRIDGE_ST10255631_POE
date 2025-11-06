
//------------------------------------------------ start of file ---------------------------------------//


/// the purpose of this class is for maintanance
/// the goal is to remove invalid customers (users)
/// it will connect to mongo, decrpt the data and delete customers who dont have account number 

//----------------- start of imports ------------//
// Import required modules
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
//-------------------- end of imports -----------------//

async function cleanupInvalidUsers() {
// Try block for cleanup process
  try {
// Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

// Find all users
    const users = await User.find({});
    let deletedCount = 0;

    for (const user of users) {
      try {
// Decrypt user data
        const decrypted = user.getDecryptedData();
        
        // Check if customer has undefined/null account number
        if (user.role === 'customer' && !decrypted.accountNumber) {
// Log deletion message
          console.log(`Deleting invalid user: ${decrypted.email || 'Unknown'} (no account number)`);
// Delete the user
          await User.deleteOne({ _id: user._id });
          deletedCount++;
        }
      } catch (err) {
        console.log(`Error processing user ${user._id}:`, err.message);
      }
    }

// Log the number of deleted users
    console.log(`\nDeleted ${deletedCount} invalid user(s)`);

// Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
// Catch block for errors
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Execute the cleanup function
cleanupInvalidUsers();

//------------------------------------------------------------- end of file --------------------------------//