# Food Tracker Web App

The Food Tracker App is a full-stack web application that allows users to track their daily meals and monitor their calorie and macronutrient intake. Users can search for food items via the Nutritionix API, add them to categorized meals (breakfast, lunch, dinner, snacks), and compare their intake against daily macro goals.

The app is built with Vue.js on the frontend and Node.js with Express and MongoDB on the backend. JWT is used for authentication, and macro goals are stored per user to provide a personalized dashboard view.

## Features

- User authentication using JWT
- Add and delete food items per meal (breakfast, lunch, dinner, snacks)
- Auto-fetch nutrition data via the Nutritionix API
- Manual food entry support
- Track calories, protein, fats, and carbs
- Set and save daily macro goals per user
- View food logs by date with previous/next navigation
- Remaining macros calculated live based on food entries

## Technologies Used

- Vue.js
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Nutritionix API

## Getting Started

To run the project locally:

```bash
git clone https://github.com/mare18explore/food-tracker-web-app.git
cd food-tracker-web-app

# Backend
cd server
npm install

# Create a .env file in /server with:
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NUTRITIONIX_APP_ID=your_nutritionix_app_id
NUTRITIONIX_APP_KEY=your_nutritionix_app_key
PORT=5050

# Start the backend server
node server.js
```

```bash
# Frontend
cd ../client
npm install

# Create a .env file in /client if needed for any frontend configs

# Start the Vue frontend
npm run dev
```

## Author
Created by Abdi Mare  
GitHub: [@mare18explore](https://github.com/mare18explore)
