<template>
  <div class="auth-container">
    <h2>Login</h2>

    <!-- Login form -->
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

    <!-- Link to register page -->
    <p>
      Don't have an account?
      <router-link to="/register">Register</router-link>
    </p>
  </div>
</template>

<script>
// AuthService handles API calls to the backend
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
      // Log the email to confirm binding works
      console.log("Trying to log in with:", this.email);

      try {
        // Send login request to backend
        const res = await AuthService.login(this.email, this.password);

        // If the backend returns a token, store it in localStorage
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        // Redirect to dashboard after successful login
        this.$router.push("/dashboard");
      } catch (err) {
        // Show error message if login fails
        console.error("Login failed:", err.response?.data?.message || err);
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
