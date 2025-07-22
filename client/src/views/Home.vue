<template>
  <div class="home-container" v-if="loaded">
    <h1>Welcome to the Food Tracker App</h1>

    <p v-if="!isLoggedIn">
      <router-link to="/login">Login</router-link>
      or
      <router-link to="/register">Register</router-link>
    </p>

    <p v-else>
      You're logged in.
      <router-link to="/dashboard">Go to Dashboard</router-link>
    </p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  name: "HomeView",

  data() {
    return {
      loaded: false,
      token: null,
    };
  },

  computed: {
    isLoggedIn() {
      return !!this.token;
    },
  },

  mounted() {
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
    logout() {
      localStorage.removeItem("token");
      this.token = null; // update reactive property
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.home-container {
  background: linear-gradient(to bottom right, #f0f4f8, #dfe9f3);
  max-width: 500px;
  margin: 3rem auto;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

p {
  font-size: 1rem;
  color: #333;
}

a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #0077cc;
  color: rgb(11, 6, 6);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
