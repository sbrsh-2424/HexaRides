// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and extract user ID
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
}

// Route to fetch user details
router.get('/user', authenticateToken, async (req, res) => {
  try {
    // Find user by ID, which is stored in the JWT
    const user = await User.findById(req.user.id).select('name employeeId email'); // Adjust fields as needed
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
