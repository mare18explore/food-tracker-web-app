// src/axios.js

// Import the Axios HTTP library
import axios from "axios";

// Create a custom Axios instance to reuse across your app
const instance = axios.create({
  // This is the base URL of your backend API (your Node.js server)
  // You can change this later if your backend runs on a different port or in production
  baseURL: "http://localhost:5050/api",

  // This allows cookies to be sent with requests (optional, only needed if using sessions)
  withCredentials: true,
});

// Export this instance so you can import and use it anywhere in your Vue app
export default instance;
