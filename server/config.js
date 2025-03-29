module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/therapy-clinic-test',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-for-testing'
}; 