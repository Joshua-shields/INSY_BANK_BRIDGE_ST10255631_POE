
//----------------------------------------- start of file --------------------------------------------//

//  seeds a test customer into the MongoDB database for testing 
//  ensure a default customer exists without duplicates.
const mongoose = require('mongoose');

// import the User model to interact with the user collection in  data base
const User = require('./models/User');

require('dotenv').config();

//  function to handle the seed proces
async function seedCustomer() {
  try {
    // Establish a connection to the MongoDB database
    // Uses Mongo URI 
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bank_bridge', {
// Connection options for compatibility the new mongo driver that come out 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // query the data ase to check if a test customer with the specified email is already there 
    // this will stop duplicates 
        const existingCustomer = await User.findOne({ email: 'testcustomer@example.com' });
// If the customer exists, log a message and exit the function early
    if (existingCustomer) {
      console.log('Test customer already exists');
      return;
    }

    // Create a new User 
    // Define sample data for testing
        const customer = new User({
          name: 'Test Customer',  // Full name of the test customer
          idNumber: '1234567890123',  // Sample South African ID number (13 digits)
          accountNumber: '1234567890123456',  // Sample account number (16 digits)
          email: 'testcustomer@example.com',  // Email address for login
          password: 'password123',  // Plain text password (will be hashed by the model)
          role: 'customer'  // User role for access control
        });

// Save the new customer 
    await customer.save();
// Log success message 
    console.log('Test customer seeded successfully');
// Catch any errors that occur during the seed 
  } catch (error) {
    console.error('Error seeding customer:', error);  // Log the error for debugging
  } finally {
// Ensure the database connection is closed regardless of success or failure
    await mongoose.connection.close();
    await mongoose.connection.close();
  }

}

// Execute the seeding function 
seedCustomer();

//------------------------------------------------ end of file -------------------------------------------//