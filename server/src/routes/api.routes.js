const express = require("express");

const router = express.Router();

router.get("/api", (req, res) => {
  res.json({
    name: "Food Expiry Tracker API",
    status: "running",
    version: "0.1.0",
    endpoints: {
      health: "/api/health",
      foods: "/api/foods",
      useFirstFoods: "/api/foods/use-first",
      foodStats: "/api/foods/stats",
    },
  });
});

module.exports = router;
