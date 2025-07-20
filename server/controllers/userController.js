const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Log the incoming request for debugging
  console.log("REGISTER HIT");
  console.log("BODY:", req.body);

  try {
    // Check if a user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and save to the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate a JWT token for the newly registered user
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Respond with user info and the token (excluding the password)
    return res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token
    });

  } catch (err) {
    // Log and return a server error if anything fails
    console.error("Registration error:", err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
  
};
// Handles user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Look for a user with the given email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if the password matches the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Send back basic user info and the token (no password)
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token
    });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Export both login and register handlers
module.exports = {
  registerUser,
  loginUser
};