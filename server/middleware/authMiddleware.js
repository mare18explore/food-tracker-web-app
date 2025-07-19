const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes with JWT auth
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get the token from the header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info (except password) to the request object
      req.user = await User.findById(decoded.id).select('-password');

      next(); // continue to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // No token provided
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };