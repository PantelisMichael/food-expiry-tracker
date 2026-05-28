const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Food Expiry Tracker API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Food Expiry Tracker API is running on http://localhost:${PORT}`);
});
