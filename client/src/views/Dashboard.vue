<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <div class="nutrition-search">
      <input v-model="foodName" type="text" placeholder="Food name" required />
      <button type="button" @click="fetchNutrition">
        Search Nutrition Info
      </button>
    </div>
    <!-- Form to add a new food entry -->
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
          placeholder="Protein (optional)"
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

    <!-- Display all food entries grouped by meal type -->
    <section class="food-list">
      <h2>Today's Meals</h2>

      <div v-for="type in mealTypes" :key="type" class="meal-section">
        <h3>{{ type }}</h3>
        <ul>
          <li v-if="foodEntriesByType(type).length === 0" class="empty-state">
            No foods added yet for {{ type }}.
          </li>
          <li v-for="item in foodEntriesByType(type)" :key="item._id">
            {{ item.name }} ({{ item.quantity }}) - {{ item.calories }} kcal
            <button @click="deleteFood(item._id)">Delete</button>
          </li>
        </ul>
      </div>
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
      quantity: 1,
      foodEntries: [],
      mealTypes: ["Breakfast", "Lunch", "Dinner", "Snack"],
    };
  },
  mounted() {
    this.fetchFoods();
  },
  methods: {
    async fetchNutrition() {
      const appId = process.env.VUE_APP_NUTRITIONIX_APP_ID;
      const appKey = process.env.VUE_APP_NUTRITIONIX_APP_KEY;
      console.log("App ID:", process.env.VUE_APP_NUTRITIONIX_APP_ID);

      if (!this.foodName) {
        console.warn("Food name is empty");
        return;
      }

      try {
        const res = await fetch(
          "https://trackapi.nutritionix.com/v2/natural/nutrients",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-app-id": appId,
              "x-app-key": appKey,
            },
            body: JSON.stringify({
              query: this.foodName,
            }),
          }
        );

        const data = await res.json();

        if (data.foods && data.foods.length > 0) {
          const food = data.foods[0];

          this.calories = Math.round(food.nf_calories);
          this.protein = Math.round(food.nf_protein);
          console.log("Nutrition fetched:", food);
        } else {
          console.warn("No results from Nutritionix");
        }
      } catch (err) {
        console.error("Error fetching nutrition:", err);
      }
    },
    async addFood() {
      const newFood = {
        name: this.foodName,
        calories: this.calories,
        protein: this.protein,
        mealType: this.mealType, // <- Trust the select value
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

        // Force update the list
        await this.fetchFoods();

        // Clear form
        this.foodName = "";
        this.calories = null;
        this.protein = null;
        this.mealType = "";
        this.quantity = 1;
      } catch (err) {
        console.error("Error adding food:", err);
      }
    },

    async deleteFood(id) {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:5050/api/foods/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete food");
        }

        await this.fetchFoods();
      } catch (err) {
        console.error("Error deleting food:", err);
      }
    },

    foodEntriesByType(type) {
      return this.foodEntries.filter(
        (item) =>
          item.mealType &&
          item.mealType.trim().toLowerCase() === type.toLowerCase()
      );
    },

    async fetchFoods() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5050/api/foods", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("Fetched foods:", data);
        data.forEach((item) => {
          console.log("MealType in DB:", item.mealType);
        });

        this.foodEntries = [...data]; // Force Vue to re-render
      } catch (err) {
        console.error("Error fetching foods:", err);
      }
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}

h1,
h2 {
  text-align: center;
  color: #2c3e50;
}

form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

input,
select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

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

.meal-section {
  margin-bottom: 2rem;
}

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
.empty-state {
  font-style: italic;
  color: #888;
  padding: 0.5rem;
}
.nutrition-search {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.nutrition-search input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

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
</style>
