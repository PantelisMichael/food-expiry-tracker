const assert = require("node:assert/strict");
const test = require("node:test");
const { createFoodRepository } = require("../src/repositories/food.repository");

function createFakeDatabase(overrides = {}) {
  return {
    $disconnect: async () => {},
    food: {
      create: async () => null,
      delete: async () => null,
      findMany: async () => [],
      findUnique: async () => null,
      update: async () => null,
      ...overrides,
    },
  };
}

function createDatabaseFood(overrides = {}) {
  return {
    id: 1,
    name: "Milk",
    category: "Dairy",
    quantity: 1,
    unit: "carton",
    location: "Fridge",
    expiryDate: new Date("2099-12-31T00:00:00.000Z"),
    itemStatus: "ACTIVE",
    ...overrides,
  };
}

test("database repository returns foods with API-friendly expiry dates", async () => {
  const database = createFakeDatabase({
    findMany: async () => [createDatabaseFood()],
  });
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  const foods = await repository.getFoods();

  assert.equal(foods.length, 1);
  assert.equal(foods[0].expiryDate, "2099-12-31");
});

test("database repository finds one food by id", async () => {
  let receivedQuery;
  const database = createFakeDatabase({
    findUnique: async (query) => {
      receivedQuery = query;
      return createDatabaseFood({ id: 7 });
    },
  });
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  const food = await repository.findFoodById(7);

  assert.deepEqual(receivedQuery, {
    where: { id: 7 },
  });
  assert.equal(food.id, 7);
  assert.equal(food.expiryDate, "2099-12-31");
});

test("database repository creates food with a PostgreSQL-compatible date", async () => {
  let receivedQuery;
  const database = createFakeDatabase({
    create: async (query) => {
      receivedQuery = query;
      return createDatabaseFood(query.data);
    },
  });
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  const food = await repository.createFood({
    name: "Milk",
    category: "Dairy",
    quantity: 1,
    unit: "carton",
    location: "Fridge",
    expiryDate: "2099-12-31",
    itemStatus: "ACTIVE",
  });

  assert.ok(receivedQuery.data.expiryDate instanceof Date);
  assert.equal(receivedQuery.data.expiryDate.toISOString(), "2099-12-31T00:00:00.000Z");
  assert.equal(food.expiryDate, "2099-12-31");
});

test("database repository updates food fields", async () => {
  let receivedQuery;
  const database = createFakeDatabase({
    update: async (query) => {
      receivedQuery = query;
      return createDatabaseFood({
        id: query.where.id,
        ...query.data,
      });
    },
  });
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  const food = await repository.updateFood(4, {
    name: "Updated Milk",
    expiryDate: "2099-12-30",
  });

  assert.deepEqual(receivedQuery.where, { id: 4 });
  assert.equal(receivedQuery.data.name, "Updated Milk");
  assert.ok(receivedQuery.data.expiryDate instanceof Date);
  assert.equal(food.expiryDate, "2099-12-30");
});

test("database repository deletes food by id", async () => {
  let receivedQuery;
  const database = createFakeDatabase({
    delete: async (query) => {
      receivedQuery = query;
      return createDatabaseFood({ id: query.where.id });
    },
  });
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  const food = await repository.deleteFood(9);

  assert.deepEqual(receivedQuery, {
    where: { id: 9 },
  });
  assert.equal(food.id, 9);
  assert.equal(food.expiryDate, "2099-12-31");
});

test("database repository updates food status", async () => {
  let receivedQuery;
  const database = createFakeDatabase({
    update: async (query) => {
      receivedQuery = query;
      return createDatabaseFood({
        id: query.where.id,
        ...query.data,
      });
    },
  });
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  const food = await repository.updateFoodStatus(3, "WASTED");

  assert.deepEqual(receivedQuery, {
    where: { id: 3 },
    data: { itemStatus: "WASTED" },
  });
  assert.equal(food.itemStatus, "WASTED");
});

test("database repository disconnects the Prisma client", async () => {
  let disconnected = false;
  const database = createFakeDatabase();
  database.$disconnect = async () => {
    disconnected = true;
  };
  const repository = createFoodRepository({
    dataSource: "database",
    database,
  });

  await repository.disconnect();

  assert.equal(disconnected, true);
});
