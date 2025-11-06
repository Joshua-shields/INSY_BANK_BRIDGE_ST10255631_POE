//----------------------------------------- start of file ------------------------------------------------//

//  script connects to the MongoDB database 
// It displays the transactions in JSON format and shows the total count of transactions in the database.

const mongoose = require('mongoose');
const Transaction = require('./backend/models/Transaction');

// MongoDB connection URI 
const MONGO_URI = 'mongodb+srv://Joshua:Joshua2025@cluster0.7kfoza5.mongodb.net/bank_bridge?retryWrites=true&w=majority&appName=Cluster0';

// make  connection to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Fetch the latest 5 transactions 
    // newest first
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n=== Latest 5 Transactions ===');
    // Display transactions 
    console.log(JSON.stringify(transactions, null, 2));
    // Display total number of transactions 
    console.log(`\nTotal transactions: ${await Transaction.countDocuments()}`);
    // Close the database connection
    mongoose.connection.close();
  })
  // Handle connection problems 
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

  //-------------------------------------------------- end of file ----------------------------------------//