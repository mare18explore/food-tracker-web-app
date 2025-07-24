const express = require('express');
const router = express.Router();

// Import from foodController
const {
  addFood,
  getUserFood,
  deleteFood,
  updateFood,
  searchNutritionix,
} = require('../controllers/foodController');

// Import from nutritionController
const { getNutrition } = require('../controllers/nutritionController');

// Middleware
const { protect } = require('../middleware/authMiddleware');

// Routes
router.route('/')
  .get(protect, getUserFood)
  .post(protect, addFood);

router.route('/:id')
  .put(protect, updateFood)
  .delete(protect, deleteFood);

// Public search routes
router.get('/search/:query', searchNutritionix);
router.post('/nutrition', getNutrition); 

module.exports = router;