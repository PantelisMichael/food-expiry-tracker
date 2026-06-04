const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const requestLogger = require("./middleware/requestLogger");
const apiRoutes = require("./routes/api.routes");
const foodRoutes = require("./routes/food.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(apiRoutes);
app.use(foodRoutes);
app.use(healthRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
