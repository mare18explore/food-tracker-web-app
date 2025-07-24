<template>
  <div class="home-container" v-if="loaded">
    <h1>Welcome to the Food Tracker App</h1>

    <!-- If the user isn't logged in, show login/register links -->
    <p v-if="!isLoggedIn">
      <router-link to="/login">Login</router-link>
      or
      <router-link to="/register">Register</router-link>
    </p>

    <!-- If logged in, show dashboard link, logout, and search -->
    <div v-else>
      <p>
        You're logged in.
        <router-link to="/dashboard">Go to Dashboard</router-link>
      </p>
      <button @click="logout">Logout</button>

      <!-- Search bar and submit button -->
      <form @submit.prevent="searchFood" class="search-form">
        <input v-model="query" placeholder="Search food..." />
        <button type="submit">Search</button>
      </form>

      <!-- Show search results after querying -->
      <div v-if="results.length">
        <h2>Search Results</h2>
        <ul>
          <!-- Loop through results and display each item -->
          <li v-for="item in results" :key="item.food_name" class="result-item">
            <p>{{ item.food_name }} — {{ item.nf_calories || "N/A" }} kcal</p>

            <!-- Dropdown for selecting which meal this food belongs to -->
            <select v-model="mealTypes[item.food_name]">
              <option disabled value="">Select meal</option>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>

            <!-- Add button gets disabled until meal type is selected -->
            <button
              @click="addFood(item.food_name)"
              :disabled="!mealTypes[item.food_name]"
            >
              Add
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",

  data() {
    return {
      loaded: false, // used to wait until token check is done
      token: null, // stores the user's auth token if logged in
      query: "", // current search string
      results: [], // search results from the backend
      mealTypes: {}, // maps food name to selected meal type
    };
  },

  computed: {
    // quick check for if the user is logged in
    isLoggedIn() {
      return !!this.token;
    },
  },

  mounted() {
    // Check for auth token on load
    console.log("HomeView loaded.");
    try {
      this.token = localStorage.getItem("token");
    } catch (err) {
      console.error("Could not read token from localStorage:", err);
      this.token = null;
    }
    this.loaded = true;
  },

  methods: {
    // clears token and redirects to login page
    logout() {
      localStorage.removeItem("token");
      this.token = null;
      this.$router.push("/login");
    },

    // searches for food from the backend
    async searchFood() {
      try {
        const res = await fetch(
          `http://localhost:5050/api/foods/search/${this.query}`
        );
        this.results = await res.json();
      } catch (err) {
        console.error("Search failed:", err);
      }
    },

    // adds the selected food to the database
    async addFood(foodName) {
      try {
        const token = localStorage.getItem("token");

        const newFood = {
          name: foodName,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          mealType: this.mealTypes[foodName] || "Snack",
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

        // confirm and reset
        alert(`${newFood.name} added to ${newFood.mealType}!`);
        this.query = "";
        this.results = [];
      } catch (err) {
        console.error("Failed to add food:", err);
      }
    },
  },
};
</script>

<style scoped>
/* container box */
.home-container {
  background: linear-gradient(to bottom right, #f0f4f8, #dfe9f3);
  max-width: 500px;
  margin: 3rem auto;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* page title */
h1 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

/* general paragraph styling */
p {
  font-size: 1rem;
  color: #333;
}

/* style links to login/register/dashboard */
a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

/* button styling */
button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #0077cc;
  color: rgb(11, 6, 6);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* spacing between search elements */
.search-form {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* individual food result box */
.result-item {
  background: #f2f2f2;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  text-align: left;
}
</style>
