const express = require("express");
const foodRoutes = require("./routes/food.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(express.json());
app.use(foodRoutes);
app.use(healthRoutes);

module.exports = app;
