// Seed a test customer
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedCustomer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bank_bridge', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if test customer already exists
    const existingCustomer = await User.findOne({ email: 'testcustomer@example.com' });
    if (existingCustomer) {
      console.log('Test customer already exists');
      return;
    }

    // Create test customer
    const customer = new User({
      name: 'Test Customer',
      idNumber: '1234567890123',
      accountNumber: '1234567890123456',
      email: 'testcustomer@example.com',
      password: 'password123',
      role: 'customer'
    });

    await customer.save();
    console.log('Test customer seeded successfully');
  } catch (error) {
    console.error('Error seeding customer:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedCustomer();