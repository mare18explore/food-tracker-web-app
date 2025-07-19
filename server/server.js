// importing express to set up the server
const express = require('express');

// importing mongoose to connect to MongoDB
const mongoose = require('mongoose');

// CORS lets our frontend talk to the backend without getting blocked by the browser
const cors = require('cors');

// loads environment variables from .env file
require('dotenv').config();

// pulling in all the user-related routes (register/login)
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');

// STARTING APP WORK
// creating the express app
const app = express();

// enable CORS so frontend (like Vue later) can send requests to backend
app.use(cors());
// allows us to read JSON from the request body (like user info)
app.use(express.json());

// any route that starts with /api/users will go to userRoutes (e.g., /register, /login)
app.use('/api/users', userRoutes);
app.use('/api/food', foodRoutes); // 


// MongoDB connection/server work

// setting the port for the server (either from .env or fallback to 5000)
const PORT = process.env.PORT || 5050;

// connect to MongoDB Atlas using the URI in .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('--->MongoDB connected'); // connection successful
    // once DB is connected, start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('Mongo error:', err)); // if DB connection fails