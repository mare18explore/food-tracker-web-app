<template>
  <div class="auth-container">
    <h2>Register</h2>

    <form @submit.prevent="registerUser">
      <input v-model="name" type="text" placeholder="Name" required />
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

    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>

<script>
import AuthService from "@/services/AuthService";

export default {
  name: "RegisterPage",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async registerUser() {
      try {
        // Log the email being used to register, useful for debugging
        console.log("Attempting to register user:", this.email);

        // Send the registration request to the backend with name, email, and password
        await AuthService.register(this.name, this.email, this.password);
        alert("Registration successful! Please log in.");
        // If the request is successful, navigate the user to the login page
        this.$router.push("/login");
      } catch (err) {
        // Log the full error object in the console for debugging
        console.error("Full error:", err);

        // Display a user-friendly error message in the UI
        this.errorMessage =
          "Registration failed: " +
          (err.response?.data?.msg || err.message || "Unknown error");
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
