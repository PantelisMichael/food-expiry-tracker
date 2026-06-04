const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`Food Expiry Tracker API is running on http://localhost:${config.port}`);
});
