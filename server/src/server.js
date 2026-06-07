const app = require("./app");
const config = require("./config/env");
const foodRepository = require("./repositories/food.repository");

const server = app.listen(config.port, () => {
  console.log(`Food Expiry Tracker API is running on http://localhost:${config.port}`);
});

async function shutDown() {
  server.close(async () => {
    await foodRepository.disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
