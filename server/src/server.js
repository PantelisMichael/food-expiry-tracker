const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Food Expiry Tracker API is running on http://localhost:${PORT}`);
});
