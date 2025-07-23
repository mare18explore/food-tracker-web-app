const Food = require('../models/Food');

const addFood = async (req, res) => {
  const { name, calories, protein, mealType, quantity } = req.body;
  console.log("Received request to add food");

  if (!name || !calories || !mealType || !quantity) {
    console.log("Missing required fields");
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newFood = await Food.create({
      user: req.user.id,
      name,
      calories,
      protein,
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

const getUserFood = async (req, res) => {
  try {
    const foods = await Food.find({ user: req.user.id }).sort({ date: -1 });
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error when fetching food data' });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

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

const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

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

module.exports = {
  addFood,
  getUserFood,
  deleteFood,
  updateFood,
};