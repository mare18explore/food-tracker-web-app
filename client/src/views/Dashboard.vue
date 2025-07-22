<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>

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
        <select v-model="mealType" required>
          <option disabled value="">Select meal type</option>
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
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
      quantity: 1,
      foodEntries: [],
      mealTypes: ["Breakfast", "Lunch", "Dinner", "Snack"],
    };
  },
  // fetch from backend when component is mounted
  mounted() {
    this.fetchFoods();
  },
  methods: {
    // Add a new food entry (fake for now, will use API later)
    addFood() {
      const newFood = {
        name: this.foodName,
        mealType: this.mealType,
        quantity: this.quantity,
        calories: 100, // placeholder
        _id: Date.now(), // mock ID for now
      };

      this.foodEntries.push(newFood);
      this.foodName = "";
      this.mealType = "";
      this.quantity = 1;
    },

    // Remove a food item by its ID
    deleteFood(id) {
      this.foodEntries = this.foodEntries.filter((item) => item._id !== id);
    },

    // Filter food entries by meal type
    foodEntriesByType(type) {
      return this.foodEntries.filter((item) => item.mealType === type);
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
</style>
