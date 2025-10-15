//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bank_bridge', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      // Update existing admin with new credentials
      existingAdmin.accountNumber = '10111026372637';
      existingAdmin.email = process.env.ADMIN_EMAIL;
      existingAdmin.password = process.env.ADMIN_PASSWORD;
      existingAdmin.name = undefined; 
      existingAdmin.idNumber = undefined;
      await existingAdmin.save();
      console.log('Admin user updated successfully');
      return;
    }

    // Create admin user using environment variables
    const admin = new User({
      accountNumber: '10111026372637',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedAdmin();
//////////////////////////////////////  end of file ////////////////////////////////////////