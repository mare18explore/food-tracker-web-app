<template>
  <div class="auth-container">
    <h2>Register</h2>

    <form @submit.prevent="registerUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
    </form>

    <p>
      Already have an account?
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<script>
// Importing the service that handles registration
import AuthService from "../services/AuthService";

export default {
  name: "RegisterView",

  data() {
    return {
      email: "",
      password: "",
    };
  },

  methods: {
    async registerUser() {
      // Log email to check form is wired up correctly
      console.log("Attempting to register user:", this.email);

      try {
        await AuthService.register(this.email, this.password);
        console.log("Registration successful");

        // Redirect to login page after registration
        this.$router.push("/login");
      } catch (err) {
        console.error("Registration failed:", err.message || err);
        alert("Could not register. Try again.");
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
