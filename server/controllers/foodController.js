// Import axios to make HTTP requests and the Food model to interact with MongoDB
const axios = require('axios');
const Food = require('../models/Food');

// Add a new food entry to the user's list
const addFood = async (req, res) => {
  const { name, calories, protein, fat, carbs, mealType, quantity } = req.body;
  console.log("Received request to add food:", req.body);

  // Basic check — make sure all required fields are included
  // Using == null so it catches both null and undefined
  if (name == null || calories == null || mealType == null || quantity == null) {
    console.log("Missing required fields");
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Save new food entry to DB, tied to the user who is logged in
    const newFood = await Food.create({
      user: req.user.id,
      name,
      calories,
      protein,
      fat,
      carbs,
      mealType,
      quantity,
    });
    console.log("Food saved to DB:", newFood);
    res.status(201).json(newFood);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when adding food' });
  }
};

// Get all food entries for the currently logged-in user
const getUserFood = async (req, res) => {
  try {
    // Sort by most recent first
    const foods = await Food.find({ user: req.user.id }).sort({ date: -1 });
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when fetching food data' });
  }
};

// Delete a specific food entry by ID
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    // Make sure the logged-in user owns this entry
    if (food.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    await food.deleteOne();
    res.json({ message: 'Food entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when deleting food' });
  }
};

// Update an existing food entry
const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields only if new values are provided
    food.name = req.body.name || food.name;
    food.calories = req.body.calories || food.calories;
    food.protein = req.body.protein || food.protein;
    food.mealType = req.body.mealType || food.mealType;
    food.quantity = req.body.quantity || food.quantity;

    const updated = await food.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Query Nutritionix for possible food matches (used for search/autocomplete)
const searchNutritionix = async (req, res) => {
  const query = req.params.query;
  console.log("Searching Nutritionix for:", query);

  try {
    const response = await axios.get("https://trackapi.nutritionix.com/v2/search/instant", {
      headers: {
        "x-app-id": process.env.NUTRITIONIX_APP_ID,
        "x-app-key": process.env.NUTRITIONIX_APP_KEY,
      },
      params: { query },
    });

    // Only send the "common" foods part of the response — that’s what we care about
    res.json(response.data.common);
  } catch (err) {
    console.error("Nutritionix API error:", err.message);
    res.status(500).json({ message: "Nutritionix search failed" });
  }
};

// Export all controller functions so they can be used in routes
module.exports = {
  addFood,
  getUserFood,
  deleteFood,
  updateFood,
  searchNutritionix,
};