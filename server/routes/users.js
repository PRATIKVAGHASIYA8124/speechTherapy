const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get users by role (protected route)
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password') // Exclude password from response
      .sort({ name: 1 }); // Sort by name
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all supervisors
router.get('/supervisors', auth, async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' })
      .select('name email role');
    res.json(supervisors);
  } catch (err) {
    console.error('Error fetching supervisors:', err);
    res.status(500).json({ message: 'Error fetching supervisors' });
  }
});

module.exports = router; 