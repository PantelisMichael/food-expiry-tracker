const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

if (process.env.DATA_SOURCE !== "database" || !process.env.DATABASE_URL) {
  throw new Error("Database tests require DATA_SOURCE=database and DATABASE_URL");
}

const app = require("../src/app");
const prisma = require("../src/config/database");

const testFoodName = "Database Integration Test Food";
let server;
let baseUrl;

before(async () => {
  await prisma.food.deleteMany({
    where: {
      name: testFoodName,
    },
  });

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await prisma.food.deleteMany({
    where: {
      name: testFoodName,
    },
  });

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await prisma.$disconnect();
});

async function apiRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();

  return { response, body };
}

async function sendJson(path, method, body) {
  return apiRequest(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("food API persists a complete workflow in PostgreSQL", async () => {
  const created = await sendJson("/api/foods", "POST", {
    name: testFoodName,
    category: "Test",
    quantity: 2,
    unit: "items",
    location: "Test Shelf",
    expiryDate: "2099-12-31",
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.name, testFoodName);

  const foodId = created.body.id;
  const databaseFood = await prisma.food.findUnique({
    where: { id: foodId },
  });

  assert.equal(databaseFood.name, testFoodName);
  assert.equal(databaseFood.quantity, 2);

  const updated = await sendJson(`/api/foods/${foodId}`, "PATCH", {
    quantity: 1,
    location: "Updated Test Shelf",
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.quantity, 1);
  assert.equal(updated.body.location, "Updated Test Shelf");

  const consumed = await sendJson(`/api/foods/${foodId}/consume`, "PATCH", {});

  assert.equal(consumed.response.status, 200);
  assert.equal(consumed.body.itemStatus, "CONSUMED");

  const deleted = await apiRequest(`/api/foods/${foodId}`, {
    method: "DELETE",
  });

  assert.equal(deleted.response.status, 200);

  const deletedDatabaseFood = await prisma.food.findUnique({
    where: { id: foodId },
  });

  assert.equal(deletedDatabaseFood, null);
});
