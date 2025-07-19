const express = require('express');
const router = express.Router();

// Bring in controller functions for each food route
const {
  addFood,
  getUserFood,
  deleteFood,
  updateFood,
} = require('../controllers/foodController');

// Middleware to protect routes (user must be logged in)
const { protect } = require('../middleware/authMiddleware');

// Handle POST (add) and GET (fetch) for food entries
router.route('/')
  .post(protect, addFood)
  .get(protect, getUserFood);

// Handle PUT (update) and DELETE for specific food entries by ID
router.route('/:id')
  .put(protect, updateFood)
  .delete(protect, deleteFood);

module.exports = router;