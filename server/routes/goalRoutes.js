const express = require("express");
const router = express.Router();
const { saveGoals, getGoals } = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, saveGoals);
router.get("/", protect, getGoals);
module.exports = router;