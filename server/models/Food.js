const mongoose = require('mongoose');

// This schema represents a food entry tracked by the user
const foodSchema = new mongoose.Schema({
  // Reference to the user who added the food
  user: {
    type: mongoose.Schema.Types.ObjectId,
    // links to User model
    ref: 'User', 
    required: true,
  },

  // Name of the food item (e.g., Chicken Breast, Apple)
  name: {
    type: String,
    required: true,
  },

  // calories in the food
  calories: {
    type: Number,
    required: true,
  },

  // Amount of protein in grams
  protein: {
    type: Number,
    default: 0,
  },
  fat: { 
    type: Number, 
    default: 0 
  },

  carbs: { 
    type: Number, 
    default: 0 
  },

  // Date the food was eaten/tracked (defaults to now)
  date: {
    type: Date,
    default: Date.now,
  },
  mealType: { type: String, required: true },
});

// Export the model so we can use it in routes and controllers
module.exports = mongoose.model('Food', foodSchema);