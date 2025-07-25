<template>
  <div class="dashboard-container">
    <router-link to="/goals">Set Goals</router-link>
    <h1><span style="font-size: 1.2em"></span> Dashboard</h1>
    <h2><span style="font-size: 1.1em">🍽️</span> Today's Meals</h2>
    <p v-if="isToday">Showing meals for: <strong>Today</strong></p>
    <p v-else>Showing meals for: {{ selectedDate }}</p>
    <p
      v-if="macroRemaining"
      :class="{
        negative: macroRemaining.calories < 0,
        positive: macroRemaining.calories > 0,
      }"
    >
      Calories: {{ macroRemaining.calories }}
    </p>
    <div class="date-nav">
      <button @click="prevDate">Previous ({{ formatRelativeDate(-1) }})</button>

      <span class="date-display">{{ formattedDate() }}</span>

      <button @click="nextDate">Next ({{ formatRelativeDate(1) }})</button>
    </div>

    <button v-if="!isToday" @click="resetDate">Go Back To Today</button>
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
      <div v-for="mealType in mealTypesList" :key="mealType">
        <h3>{{ mealType }}</h3>
        <div class="meal-totals-row" v-if="macrosByMeal[mealType]">
          <span>Calories: {{ macrosByMeal[mealType].calories }} kcal</span>
          <span>Protein: {{ macrosByMeal[mealType].protein }} g</span>
          <span>Fat: {{ macrosByMeal[mealType].fat }} g</span>
          <span>Carbs: {{ macrosByMeal[mealType].carbs }} g</span>
        </div>
        <ul
          v-if="macrosByMeal[mealType] && macrosByMeal[mealType].items.length"
        >
          <li v-for="item in macrosByMeal[mealType].items" :key="item._id">
            {{ item.name }} ({{ item.quantity }}) - {{ item.calories }} kcal
            <button @click="deleteFood(item._id)">Delete</button>
          </li>
        </ul>

        <ul v-else class="empty-state">
          <li>No foods added yet for {{ mealType }}.</li>
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

    <div v-if="macroRemaining" class="macro-remaining">
      <h3>Remaining</h3>
      <p :class="{ negative: macroRemaining.calories < 0 }">
        Calories: {{ macroRemaining.calories }}
      </p>
      <p :class="{ negative: macroRemaining.protein < 0 }">
        Protein: {{ macroRemaining.protein }} g
      </p>
      <p :class="{ negative: macroRemaining.fats < 0 }">
        Fats: {{ macroRemaining.fats }} g
      </p>
      <p :class="{ negative: macroRemaining.carbs < 0 }">
        Carbs: {{ macroRemaining.carbs }} g
      </p>
    </div>
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
      mealTypesList: ["Breakfast", "Lunch", "Dinner", "Snack"],
      selectedDate: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 10),
      macroGoals: null,
      macroRemaining: null,
      macroTotals: {
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
      },
    };
  },
  watch: {
    selectedDate() {
      this.fetchFoods();
      this.fetchMacroGoals();
    },
    foodEntries() {
      this.calculateMacroTotals(); // recalculate when foods change
    },
    macroGoals() {
      this.calculateMacroTotals(); // recalculate when goals change too
    },
  },

  computed: {
    // to highlight date
    isToday() {
      const today = new Date().toISOString().substring(0, 10);
      return this.selectedDate === today;
    },
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

  async mounted() {
    // Load existing food entries on page load
    await this.fetchFoods(); // Load user's food
    await this.fetchMacroGoals(); // Load macro goals from backend
  },

  methods: {
    calculateMacroTotals() {
      // example — update based on actual structure of your food entries
      this.macroTotals = {
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
      };
      // Loop through all food entries and sum up each macro
      this.foodEntries.forEach((entry) => {
        this.macroTotals.calories += entry.calories;
        this.macroTotals.protein += entry.protein;
        this.macroTotals.fats += entry.fats;
        this.macroTotals.carbs += entry.carbs;
      });
      // After calculating totals, update the remaining values but with a checker incase
      if (!this.macroGoals) {
        console.log("No goals found for this user.");
        this.macroRemaining = null;
        return;
      }
      this.calculateRemaining();
    },
    calculateRemaining() {
      // If macro goals aren't loaded yet, skip calculating remaining
      if (!this.macroGoals) {
        this.macroRemaining = null;
        return;
      }
      // Subtract totals from goals to get the remaining macros
      this.macroRemaining = {
        calories: this.macroGoals.calories - this.macroTotals.calories,
        protein: this.macroGoals.protein - this.macroTotals.protein,
        fats: this.macroGoals.fats - this.macroTotals.fats,
        carbs: this.macroGoals.carbs - this.macroTotals.carbs,
      };
      console.log("macroGoals:", this.macroGoals);
      console.log("macroTotals:", this.macroTotals);
    },

    // Formats the currently selected date for display
    formattedDate() {
      const date = new Date(this.selectedDate + "T00:00:00");
      return date.toDateString();
    },

    // Formats a relative date like "Previous" or "Next"
    formatRelativeDate(offset) {
      const base = new Date(this.selectedDate + "T00:00:00");
      base.setDate(base.getDate() + offset);
      return base.toDateString();
    },
    // changes to date to account for timezone
    // Move to the next date
    nextDate() {
      const next = new Date(this.selectedDate);
      next.setDate(next.getDate() + 1);
      this.selectedDate = next.toISOString().substring(0, 10);
    },

    prevDate() {
      const prev = new Date(this.selectedDate);
      prev.setDate(prev.getDate() - 1);
      this.selectedDate = prev.toISOString().substring(0, 10);
    },

    // Reset to today's date
    resetDate() {
      this.selectedDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 10);
    },

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
        date: this.selectedDate,
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
        const response = await fetch(
          `http://localhost:5050/api/foods?date=${this.selectedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        this.foodEntries = [...data];
        // must call to claculate remaining totals
        this.calculateMacroTotals();
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
    async fetchMacroGoals() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5050/api/goals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.warn("No saved goals found or failed to fetch.");
          return;
        }

        const data = await res.json();
        this.macroGoals = data;

        // Only calculate totals once goals are loaded
        this.calculateMacroTotals();
      } catch (err) {
        console.error("Error fetching goals from backend:", err);
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
  background: linear-gradient(to top right, #ffffff, #f5faff);
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
  transition: all 0.2s ease-in-out;
  font-weight: bold;
}

button:hover {
  transform: scale(1.05);
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
ul li {
  cursor: pointer;
}
ul li:hover {
  background-color: #dff0ff;
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
.totals-section {
  background: #eef6ff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
}
.date-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap; /* allow responsive wrap */
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.date-display {
  font-weight: bold;
  padding: 0.5rem;
}
.macro-remaining {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f4f4f4;
  border-radius: 8px;
}

.macro-remaining p {
  margin: 0.3rem 0;
  font-weight: 500;
}

.negative {
  color: red;
}
.positive {
  color: green;
}
</style>
