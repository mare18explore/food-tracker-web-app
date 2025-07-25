// This file defines the User schema for MongoDB using Mongoose
const mongoose = require('mongoose');

// Define what a User looks like in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // name is required
  },
  email: {
    type: String,
    required: true,
    unique: true // no duplicate emails allowed
  },
  password: {
    type: String,
    required: true // password will be hashed
  },
  goals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 }
  }
});

// Export the User model so we can use it elsewhere in our app
module.exports = mongoose.model('User', userSchema);