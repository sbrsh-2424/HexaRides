// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User'); // Import User model
const app = express();

const user1 = mongoose.model("users");
app.use(express.json());
app.use(cors());

const PORT = 3002;
const MONGODB_URL = "mongodb+srv://kvarman48:sasikala128@cluster0.gsbvc.mongodb.net/CRUD?retryWrites=true&w=majority";
const JWT_SECRET = '357615a3801943554f7dd0e4e41e159c9b849410eaa674e30364570c6f4efe81500f24f2e81ff1d465bba93bed21de9e6fa7ff0f56aa221144c33ea879bd7fbd';

// Connect to MongoDB
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Database connection error:', error));

// Login route for user authentication
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await user1.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    // const isMatch = await bcrypt.compare(password, user.password);
    const pwd = await user1.findOne({ password });
    if (!pwd) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
app.get('/user', authenticateToken, async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
