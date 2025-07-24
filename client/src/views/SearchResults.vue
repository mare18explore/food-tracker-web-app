<template>
  <div class="search-results-container">
    <h2>Results for "{{ $route.query.q }}"</h2>

    <!-- Show loading while waiting for results -->
    <div v-if="loading">Loading...</div>

    <!-- Message if no results came back -->
    <div v-else-if="results.length === 0">No results found.</div>

    <!-- List of food results -->
    <ul>
      <li v-for="item in results" :key="item.food_name" class="result-item">
        <h3>{{ item.food_name }}</h3>
        <p>Calories (Estimate): {{ item.nf_calories || "N/A" }} kcal</p>

        <!-- Dropdown to pick which meal this food belongs to -->
        <select v-model="mealTypes[item.food_name]">
          <option disabled value="">Select meal</option>
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
        </select>

        <!-- Button to add food (disabled if no meal selected) -->
        <button
          @click="addFood(item.food_name)"
          :disabled="!mealTypes[item.food_name]"
        >
          Add
        </button>
      </li>
    </ul>

    <!-- Go back to home page -->
    <button @click="$router.push('/')">Back</button>
  </div>
</template>

<script>
export default {
  name: "SearchResults",
  data() {
    return {
      results: [], // list of foods returned from search
      loading: true, // whether we're still waiting for the API
      mealTypes: {}, // store selected meal type for each food
    };
  },

  async created() {
    const query = this.$route.query.q;

    if (!query) {
      this.loading = false;
      return;
    }

    try {
      // fetch results based on query from URL
      const res = await fetch(
        `http://localhost:5050/api/foods/search/${query}`
      );
      const data = await res.json();

      // make sure it's an array before assigning
      if (Array.isArray(data)) {
        this.results = data;
      } else {
        console.warn("Unexpected data format from API:", data);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async addFood(foodName) {
      const selectedMeal = this.mealTypes[foodName];

      if (!selectedMeal) {
        alert("Please select a meal before adding.");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // dummy values since we don’t get full macros here
        const newFood = {
          name: foodName,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          mealType: selectedMeal,
          quantity: 1,
        };

        const saveRes = await fetch("http://localhost:5050/api/foods", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newFood),
        });

        if (!saveRes.ok) {
          const saveErr = await saveRes.json();
          console.error("Error saving food:", saveErr);
          return;
        }

        alert(`${newFood.name} added to ${newFood.mealType}!`);
        this.$router.push("/");
      } catch (err) {
        console.error("Failed to add food:", err);
      }
    },
  },
};
</script>

<style scoped>
.search-results-container {
  padding: 1.5rem;
  max-width: 800px;
  margin: auto;
}

.result-item {
  background: #f9f9f9;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 10px;
}
</style>
