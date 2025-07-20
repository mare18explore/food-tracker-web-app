// Import our pre-configured Axios instance
import axios from "../axios";
//no token stuff handled here yet
const AuthService = {
  // Send POST request to backend to register a new user
  register(email, password) {
    return axios.post("/auth/register", {
      email,
      password,
    });
  },

  // Send POST request to backend to log in a user
  login(email, password) {
    return axios.post("/auth/login", {
      email,
      password,
    });
  },
};

export default AuthService;
