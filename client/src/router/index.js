import { createRouter, createWebHistory } from "vue-router";

// import views (assuming they exist under /views)
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import SearchResults from "../views/SearchResults.vue";

// define app routes
const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard },
  { path: "/results", component: SearchResults },
];

// create and export the router instance
const router = createRouter({
  // default Vue history mode, fixed these errors
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
