<template>
  <div class="auth-container">
    <h2>Login</h2>

    <form @submit.prevent="loginUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>

    <p>
      Don't have an account?
      <router-link to="/register">Register</router-link>
    </p>
  </div>
</template>

<script>
// Importing the auth service functions for login
import AuthService from "../services/AuthService";

export default {
  name: "LoginView",

  data() {
    return {
      email: "",
      password: "",
    };
  },

  methods: {
    async loginUser() {
      // Quick console check for input values before API call
      console.log("Trying to log in with:", this.email);

      try {
        const res = await AuthService.login(this.email, this.password);
        console.log("Login successful");
        console.log("Login response:", res);

        // Navigate to home or dashboard after login
        this.$router.push("/");
      } catch (err) {
        console.error("Login failed:", err.message || err);
        alert("Login failed. Check your credentials.");
      }
    },
  },
};
</script>

<style scoped>
.auth-container {
  width: 100%;
  max-width: 400px;
  margin: 3rem auto;
  display: flex;
  flex-direction: column;
}
input {
  margin-bottom: 1rem;
  padding: 0.5rem;
}
button {
  padding: 0.5rem;
}
</style>
