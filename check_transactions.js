const mongoose = require('mongoose');
const Transaction = require('./backend/models/Transaction');

const MONGO_URI = 'mongodb+srv://Joshua:Joshua2025@cluster0.7kfoza5.mongodb.net/bank_bridge?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n=== Latest 5 Transactions ===');
    console.log(JSON.stringify(transactions, null, 2));
    console.log(`\nTotal transactions: ${await Transaction.countDocuments()}`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
