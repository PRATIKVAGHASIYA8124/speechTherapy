const mongoose = require('mongoose');
const config = require('../config');

// Connect to test database
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear database after each test
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Close database connection
const closeDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, clearDatabase, closeDatabase }; 