const express = require('express');
const router = express.Router();

const {
  addFood,
  getUserFood,
  deleteFood,
  updateFood,
} = require('../controllers/foodController');

// Middleware that attaches `req.user` (e.g., from JWT)
const { protect } = require('../middleware/authMiddleware');

// Routes that use /api/foods as the base path in index.js

// GET all foods for a user, POST a new food
router.route('/')
  .get(protect, getUserFood)
  .post(protect, addFood);

// PUT or DELETE a specific food entry
router.route('/:id')
  .put(protect, updateFood)
  .delete(protect, deleteFood);

module.exports = router;