const express = require("express");

const router = express.Router();

router.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Food Expiry Tracker API is running",
  });
});

module.exports = router;
