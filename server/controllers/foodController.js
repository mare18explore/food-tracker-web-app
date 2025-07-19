const Food = require('../models/Food');

// @desc    Add a new food entry
// @route   POST /api/food
// @access  Private (user must be logged in)
const addFood = async (req, res) => {
  const { name, calories, protein } = req.body;

  // Check for missing fields
  if (!name || !calories) {
    return res.status(400).json({ message: 'Name and calories are required' });
  }

  try {
    const newFood = await Food.create({
      user: req.user.id, // comes from auth middleware
      name,
      calories,
      protein,
    });

    res.status(201).json(newFood);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when adding food' });
  }
};

// @desc    Get all food entries for the logged-in user
// @route   GET /api/food
// @access  Private
const getUserFood = async (req, res) => {
  try {
    const foods = await Food.find({ user: req.user.id }).sort({ date: -1 });
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when fetching food data' });
  }
};

// @desc    Delete a specific food entry
// @route   DELETE /api/food/:id
// @access  Private
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    // Make sure the food entry belongs to the logged-in user
    if (food.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // 👇 Use deleteOne instead of remove
    await food.deleteOne();
    res.json({ message: 'Food entry deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when deleting food' });
  }
};

const updateFood = async (req, res) => {
  try {
    // Try to find the food entry by its ID from the request parameters
    const food = await Food.findById(req.params.id);

    // If no food is found, return a 404 response
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Make sure the food entry belongs to the currently logged-in user
    if (food.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update only the fields that are provided in the request body
    food.name = req.body.name || food.name;
    food.calories = req.body.calories || food.calories;
    food.protein = req.body.protein || food.protein;

    // Save the updated food entry back to the database
    const updated = await food.save();

    // Respond with the updated food object
    res.json(updated);
  } catch (err) {
    // Log any unexpected errors and return a 500 status
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addFood,
  getUserFood,
  deleteFood,
  updateFood,
};