import { createRouter, createWebHistory } from "vue-router";

// import views (assuming they exist under /views)
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";

// define app routes
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
];

// create and export the router instance
const router = createRouter({
  // default Vue history mode, fixed these errors
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
