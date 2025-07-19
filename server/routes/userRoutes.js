// This file sets up the API routes for user login and registration
const express = require('express');
const router = express.Router();

// Import controller functions
const { registerUser, loginUser } = require('../controllers/userController');

// POST /api/users/register → Create a new user
router.post('/register', registerUser);

// POST /api/users/login → Login existing user
router.post('/login', loginUser);

// Export the router to use in server.js
module.exports = router;