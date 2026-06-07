const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../src/app");
const foodRepository = require("../src/repositories/food.repository");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await foodRepository.disconnect();
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

test("GET /api returns API metadata", async () => {
  const { response, body } = await apiRequest("/api");

  assert.equal(response.status, 200);
  assert.equal(body.name, "Food Expiry Tracker API");
  assert.equal(body.status, "running");
  assert.equal(body.endpoints.foods, "/api/foods");
});

test("GET /api/health confirms that the API is running", async () => {
  const { response, body } = await apiRequest("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "ok",
    message: "Food Expiry Tracker API is running",
  });
});

test("GET /api/foods returns foods with calculated expiry information", async () => {
  const { response, body } = await apiRequest("/api/foods");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.length > 0);
  assert.equal(typeof body[0].daysUntilExpiry, "number");
  assert.ok(["SAFE", "EXPIRING_SOON", "EXPIRED"].includes(body[0].status));
});

test("GET /api/foods supports search, filtering, and sorting", async () => {
  const searchResult = await apiRequest("/api/foods?search=milk");
  const filterResult = await apiRequest("/api/foods?location=fridge");
  const sortResult = await apiRequest("/api/foods?sort=name&order=asc");

  assert.equal(searchResult.response.status, 200);
  assert.ok(searchResult.body.some((food) => food.name === "Milk"));

  assert.equal(filterResult.response.status, 200);
  assert.ok(filterResult.body.every((food) => food.location === "Fridge"));

  assert.equal(sortResult.response.status, 200);
  const names = sortResult.body.map((food) => food.name);
  const sortedNames = [...names].sort((first, second) => first.localeCompare(second));
  assert.deepEqual(names, sortedNames);
});

test("GET /api/foods/use-first returns active, non-expired foods by expiry date", async () => {
  const { response, body } = await apiRequest("/api/foods/use-first");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.every((food) => food.itemStatus === "ACTIVE"));
  assert.ok(body.every((food) => food.status !== "EXPIRED"));

  const expiryDates = body.map((food) => food.expiryDate);
  const sortedExpiryDates = [...expiryDates].sort();
  assert.deepEqual(expiryDates, sortedExpiryDates);
});

test("the API returns useful errors for invalid requests", async () => {
  const invalidSort = await apiRequest("/api/foods?sort=invalid");
  const invalidId = await apiRequest("/api/foods/not-a-number");
  const missingFood = await apiRequest("/api/foods/999999");
  const unknownRoute = await apiRequest("/api/not-a-real-route");

  assert.equal(invalidSort.response.status, 400);
  assert.equal(invalidSort.body.error, "sort must be expiryDate or name");

  assert.equal(invalidId.response.status, 400);
  assert.equal(invalidId.body.error, "Food id must be a positive number");

  assert.equal(missingFood.response.status, 404);
  assert.equal(missingFood.body.error, "Food item not found");

  assert.equal(unknownRoute.response.status, 404);
  assert.equal(unknownRoute.body.error, "Route not found");
});

test("POST /api/foods validates required fields, dates, and quantity", async () => {
  const missingFields = await sendJson("/api/foods", "POST", {
    category: "Dairy",
  });
  const invalidDate = await sendJson("/api/foods", "POST", {
    name: "Test Food",
    expiryDate: "not-a-date",
  });
  const invalidQuantity = await sendJson("/api/foods", "POST", {
    name: "Test Food",
    quantity: 0,
    expiryDate: "2099-12-31",
  });

  assert.equal(missingFields.response.status, 400);
  assert.equal(missingFields.body.error, "Name and expiryDate are required");

  assert.equal(invalidDate.response.status, 400);
  assert.equal(invalidDate.body.error, "expiryDate must be a valid date in YYYY-MM-DD format");

  assert.equal(invalidQuantity.response.status, 400);
  assert.equal(invalidQuantity.body.error, "Quantity must be a positive number");
});

test("a food item can be created, updated, consumed, and deleted", async () => {
  const created = await sendJson("/api/foods", "POST", {
    name: "Test Yogurt",
    category: "Dairy",
    quantity: 2,
    unit: "cups",
    location: "Fridge",
    expiryDate: "2099-12-31",
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.name, "Test Yogurt");
  assert.equal(created.body.itemStatus, "ACTIVE");
  assert.equal(created.body.status, "SAFE");

  const foodId = created.body.id;
  const found = await apiRequest(`/api/foods/${foodId}`);

  assert.equal(found.response.status, 200);
  assert.equal(found.body.id, foodId);

  const updated = await sendJson(`/api/foods/${foodId}`, "PATCH", {
    name: "Updated Test Yogurt",
    quantity: 1,
    location: "Freezer",
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.name, "Updated Test Yogurt");
  assert.equal(updated.body.quantity, 1);
  assert.equal(updated.body.location, "Freezer");

  const consumed = await sendJson(`/api/foods/${foodId}/consume`, "PATCH", {});

  assert.equal(consumed.response.status, 200);
  assert.equal(consumed.body.itemStatus, "CONSUMED");

  const consumedFoods = await apiRequest("/api/foods?itemStatus=CONSUMED");
  assert.ok(consumedFoods.body.some((food) => food.id === foodId));

  const deleted = await apiRequest(`/api/foods/${foodId}`, {
    method: "DELETE",
  });

  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.body.message, "Food item deleted");
  assert.equal(deleted.body.food.id, foodId);

  const missingAfterDelete = await apiRequest(`/api/foods/${foodId}`);
  assert.equal(missingAfterDelete.response.status, 404);
});

test("a food item can be wasted and appears in food statistics", async () => {
  const created = await sendJson("/api/foods", "POST", {
    name: "Test Lettuce",
    category: "Vegetables",
    location: "Fridge",
    expiryDate: "2099-12-31",
  });
  const foodId = created.body.id;

  const wasted = await sendJson(`/api/foods/${foodId}/waste`, "PATCH", {});
  const stats = await apiRequest("/api/foods/stats");

  assert.equal(wasted.response.status, 200);
  assert.equal(wasted.body.itemStatus, "WASTED");
  assert.equal(stats.response.status, 200);
  assert.ok(stats.body.itemStatusCounts.WASTED >= 1);
  assert.ok(stats.body.categoryCounts.Vegetables >= 1);
  assert.ok(stats.body.locationCounts.Fridge >= 1);

  const deleted = await apiRequest(`/api/foods/${foodId}`, {
    method: "DELETE",
  });
  assert.equal(deleted.response.status, 200);
});
