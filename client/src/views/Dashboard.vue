<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>

    <!-- Search for food using Nutritionix API -->
    <div class="nutrition-search">
      <input
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        placeholder="Search food..."
      />
    </div>

    <!-- Show Nutritionix preview for selected food -->
    <div v-if="selectedFood" class="modal">
      <h3>{{ selectedFood.food_name }}</h3>
      <p>
        <strong>Serving Size:</strong> {{ selectedFood.serving_qty }}
        {{ selectedFood.serving_unit }}
      </p>
      <p><strong>Calories:</strong> {{ selectedFood.nf_calories }} kcal</p>
      <p><strong>Protein:</strong> {{ selectedFood.nf_protein }} g</p>
      <p><strong>Fat:</strong> {{ selectedFood.nf_total_fat }} g</p>
      <p><strong>Carbs:</strong> {{ selectedFood.nf_total_carbohydrate }} g</p>
      <button @click="useSelectedFood">Use This</button>
      <button @click="selectedFood = null">Cancel</button>
    </div>

    <!-- Show raw search results as list -->
    <ul v-if="searchResults.length">
      <li
        v-for="item in searchResults"
        :key="item.food_name"
        @click="selectFood(item)"
      >
        {{ item.food_name }}
      </li>
    </ul>

    <!-- Quick preview of manually-entered macros before submitting -->
    <div
      v-if="
        calories !== null || protein !== null || fat !== null || carbs !== null
      "
    >
      <p><strong>Calories:</strong> {{ calories || 0 }} kcal</p>
      <p><strong>Protein:</strong> {{ protein || 0 }} g</p>
      <p><strong>Fat:</strong> {{ fat || 0 }} g</p>
      <p><strong>Carbs:</strong> {{ carbs || 0 }} g</p>
    </div>

    <!-- Add food form: either manually or filled by Nutritionix -->
    <section class="add-food">
      <h2>Add Food</h2>
      <form @submit.prevent="addFood">
        <input
          v-model="foodName"
          type="text"
          placeholder="Food name"
          required
        />
        <input
          v-model.number="calories"
          type="number"
          min="0"
          placeholder="Calories"
          required
        />
        <input
          v-model.number="protein"
          type="number"
          min="0"
          placeholder="Protein"
        />
        <input v-model.number="fat" type="number" min="0" placeholder="Fat" />
        <input
          v-model.number="carbs"
          type="number"
          min="0"
          placeholder="Carbs"
        />
        <select v-model="mealType" required>
          <option disabled value="">Select meal type</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          placeholder="Quantity"
          required
        />
        <button type="submit">Add</button>
      </form>
    </section>

    <!-- Show food entries grouped by meal type -->
    <section class="food-list">
      <h2>Today's Meals</h2>
      <p v-if="Object.keys(macrosByMeal).length === 0">
        No meals logged today yet.
      </p>
      <div v-for="(meal, mealType) in macrosByMeal" :key="mealType">
        <h3>{{ mealType }}</h3>
        <div class="meal-totals-row">
          <span>Calories: {{ meal.calories }} kcal</span>
          <span>Protein: {{ meal.protein }} g</span>
          <span>Fat: {{ meal.fat }} g</span>
          <span>Carbs: {{ meal.carbs }} g</span>
        </div>
        <ul v-if="meal.items.length === 0" class="empty-state">
          <li>No foods added yet for {{ mealType }}.</li>
        </ul>
        <ul v-else>
          <li v-for="item in meal.items" :key="item._id">
            {{ item.name }} ({{ item.quantity }}) - {{ item.calories }} kcal
            <button @click="deleteFood(item._id)">Delete</button>
          </li>
        </ul>
      </div>
    </section>

    <!-- Show total macros for the day -->
    <section class="totals-section">
      <h3>Daily Totals</h3>
      <p><strong>Calories:</strong> {{ totalCalories }} kcal</p>
      <p><strong>Protein:</strong> {{ totalProtein }} g</p>
      <p><strong>Fat:</strong> {{ totalFat }} g</p>
      <p><strong>Carbs:</strong> {{ totalCarbs }} g</p>
    </section>
  </div>
</template>

<script>
export default {
  name: "DashboardView",

  data() {
    return {
      foodName: "",
      mealType: "",
      calories: null,
      protein: null,
      fat: null,
      carbs: null,
      quantity: 1,
      foodEntries: [],
      searchQuery: "",
      searchResults: [],
      selectedFood: null,
    };
  },

  computed: {
    // Daily macro totals
    totalCalories() {
      return this.foodEntries.reduce((sum, f) => sum + (f.calories || 0), 0);
    },
    totalProtein() {
      return this.foodEntries.reduce((sum, f) => sum + (f.protein || 0), 0);
    },
    totalFat() {
      return this.foodEntries.reduce((sum, f) => sum + (f.fat || 0), 0);
    },
    totalCarbs() {
      return this.foodEntries.reduce((sum, f) => sum + (f.carbs || 0), 0);
    },

    // Organize food entries by meal type and sum macros
    macrosByMeal() {
      const grouped = {};
      for (const entry of this.foodEntries) {
        if (!grouped[entry.mealType]) {
          grouped[entry.mealType] = {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            items: [],
          };
        }
        grouped[entry.mealType].calories += entry.calories || 0;
        grouped[entry.mealType].protein += entry.protein || 0;
        grouped[entry.mealType].fat += entry.fat || 0;
        grouped[entry.mealType].carbs += entry.carbs || 0;
        grouped[entry.mealType].items.push(entry);
      }
      return grouped;
    },
  },

  mounted() {
    // Load existing food entries on page load
    this.fetchFoods();
  },

  methods: {
    // Fetch macros for a selected food from search
    async selectFood(foodItem) {
      this.searchQuery = "";
      this.searchResults = [];

      try {
        const res = await fetch("http://localhost:5050/api/foods/nutrition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: foodItem.food_name }),
        });

        const data = await res.json();
        if (data.foods?.length) {
          this.selectedFood = data.foods[0];
        } else {
          console.warn("No macros found for selected item");
        }
      } catch (err) {
        console.error("Error fetching macros:", err);
      }
    },

    // Fill the form with Nutritionix preview data
    useSelectedFood() {
      this.foodName = this.selectedFood.food_name;
      this.calories = Math.round(this.selectedFood.nf_calories || 0);
      this.protein = Math.round(this.selectedFood.nf_protein || 0);
      this.fat = Math.round(this.selectedFood.nf_total_fat || 0);
      this.carbs = Math.round(this.selectedFood.nf_total_carbohydrate || 0);
      this.selectedFood = null;
      this.searchResults = [];
      this.mealType = "";
    },

    // Add new food to backend and refresh list
    async addFood() {
      const newFood = {
        name: this.foodName,
        calories: this.calories,
        protein: this.protein,
        fat: this.fat,
        carbs: this.carbs,
        mealType: this.mealType,
        quantity: this.quantity,
      };

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5050/api/foods", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newFood),
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error(
            "Add food failed:",
            errData.message || response.statusText
          );
          return;
        }

        alert(`${this.foodName} added to ${this.mealType}`);
        await this.fetchFoods();

        // Reset form values
        this.foodName = "";
        this.calories = null;
        this.protein = null;
        this.carbs = null;
        this.fat = null;
        this.mealType = "";
        this.quantity = 1;
      } catch (err) {
        console.error("Error adding food:", err);
      }
    },

    // Delete a food by its ID
    async deleteFood(id) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5050/api/foods/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to delete food");
        await this.fetchFoods();
      } catch (err) {
        console.error("Error deleting food:", err);
      }
    },

    // Load user's food data from backend
    async fetchFoods() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5050/api/foods", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        this.foodEntries = [...data];
      } catch (err) {
        console.error("Error fetching foods:", err);
      }
    },

    // Run search using Nutritionix API
    async handleSearch() {
      try {
        const res = await fetch(
          `http://localhost:5050/api/foods/search/${this.searchQuery}`
        );
        const data = await res.json();
        this.searchResults = data;
      } catch (err) {
        console.error("Search failed:", err);
      }
    },
  },
};
</script>
<style scoped>
/* Container for everything inside the dashboard */
.dashboard-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}

/* Headings */
h1,
h2 {
  text-align: center;
  color: #2c3e50;
}

/* Form layout for adding food */
form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

/* Inputs and dropdowns inside the form */
input,
select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

/* Default button style */
button {
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

/* Section that displays each meal group */
.meal-section {
  margin-bottom: 2rem;
}

/* General list reset and item styling */
ul {
  list-style: none;
  padding: 0;
}

li {
  background-color: #f7f7f7;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Styling for meals that don't have any foods yet */
.empty-state {
  font-style: italic;
  color: #888;
  padding: 0.5rem;
}

/* Search input wrapper */
.nutrition-search {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

/* Search bar input */
.nutrition-search input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

/* Search button style */
.nutrition-search button {
  padding: 0.6rem 1rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.nutrition-search button:hover {
  background-color: #1e8449;
}

/* Modal window when previewing selected food */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 400px;
  width: 90%;
}

.modal button {
  margin-right: 0.5rem;
  margin-top: 1rem;
}

/* Displays total macros for each meal */
.meal-totals-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #2c3e50;
}

/* Styling for the macro preview box */
.macro-preview {
  background-color: #f0f8ff;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}
</style>
