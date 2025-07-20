<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/register">Register</router-link>
    </nav>

    <!-- This will render the routed component -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
nav {
  padding: 1rem;
}
nav a {
  margin: 0 10px;
  font-weight: bold;
}
</style>
