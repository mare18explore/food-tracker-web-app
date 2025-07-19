// Handles user-related logic (registering and logging in)
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Create a JWT token for the new user
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d' // token lasts for 7 days
    });

    // Return the new user's info (excluding password)
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
  console.log("REGISTER HIT");
  console.log("BODY:", req.body)
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Return user info and token
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { registerUser, loginUser };