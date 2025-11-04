const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017/bank_bridge').then(async () => {
  const users = await User.find({});
  console.log('Registered users:', users);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});