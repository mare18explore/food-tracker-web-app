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
  background-color: #fff;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  margin: auto;
}
form {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 10px;
}
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

input {
  margin-bottom: 1rem;
  padding: 0.6rem;
  font-size: 1rem;
}

button {
  padding: 0.6rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
p {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.95rem;
}

a {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style>
