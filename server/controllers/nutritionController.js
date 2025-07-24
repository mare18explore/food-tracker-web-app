const axios = require("axios");

// Handles the macro lookup request using Nutritionix's /natural/nutrients endpoint
const getNutrition = async (req, res) => {
  const { query } = req.body;

  // Make sure the request includes a valid query string
  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Missing food query" });
  }

  console.log("Received Nutritionix macro request with query:", query);

  try {
    // Send a POST request to Nutritionix with the food name
    // Prepending "1" helps ensure the query is formatted in a way Nutritionix expects
    const response = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      {
        query: `1 ${query}` // this makes it easier for Nutritionix to recognize the food
      },
      {
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const foods = response.data.foods;

    // If Nutritionix doesn't return any food info, respond with an error
    if (!foods || foods.length === 0) {
      return res.status(404).json({ error: "No food found in response" });
    }

    // Return the list of foods (usually just one)
    res.json({ foods });
  } catch (err) {
    // Log detailed error info for debugging
    console.error("Nutritionix API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Nutrition data fetch failed" });
  }
};

module.exports = { getNutrition };