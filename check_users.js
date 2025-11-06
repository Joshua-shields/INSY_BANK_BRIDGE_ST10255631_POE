
//--------------------------- start of file ----------------------------//
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017/bank_bridge').then(async () => {
  // Fetch all user documents from the database
  const users = await User.find({});
  // Log the users 
  console.log('Registered users:', users);
  // Exit the process successfully
  process.exit(0);
}).catch(err => {
  // Log any connection or query errors
  console.error('Error:', err);
  // Exit the process with an error code
  process.exit(1);
});

//---------------------------------- end of file ---------------------------//