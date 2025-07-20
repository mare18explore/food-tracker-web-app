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
        console.log("Attempting to register user:", this.email);
        await AuthService.register(this.name, this.email, this.password);
        // Success handling (e.g. route to dashboard or show message)
      } catch (err) {
        console.error("Full error:", err);
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
