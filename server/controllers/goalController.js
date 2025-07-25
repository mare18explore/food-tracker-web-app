const User = require("../models/User");

// Save goals to the authenticated user
exports.saveGoals = async (req, res) => {
  try {
    const { calories, protein, fats, carbs } = req.body;
    const user = await User.findById(req.user.id);

    user.goals = { calories, protein, fats, carbs };
    await user.save();

    console.log(" Saved goals for user:", user.email, user.goals);

    res.status(200).json({ message: "Goals saved successfully." });
  } catch (err) {
    console.error(" Error saving goals:", err);
    res.status(500).json({ message: "Server error saving goals." });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.goals) {
      return res.status(404).json({ message: "No goals set for user" });
    }
    res.status(200).json(user.goals);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching goals." });
  }
};