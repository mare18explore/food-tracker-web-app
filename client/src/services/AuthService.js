// client/src/services/AuthService.js

import axios from "../axios";

const AuthService = {
  register(name, email, password) {
    return axios.post("/users/register", {
      name,
      email,
      password,
    });
  },

  login(email, password) {
    return axios.post("/users/login", {
      email,
      password,
    });
  },
};

export default AuthService;
