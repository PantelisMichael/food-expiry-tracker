const config = require("../config/env");
const memoryData = require("../data/foods.data");
const { getDateFromDateString } = require("../utils/food.utils");

function formatFood(food) {
  return {
    ...food,
    expiryDate:
      food.expiryDate instanceof Date
        ? food.expiryDate.toISOString().slice(0, 10)
        : food.expiryDate,
  };
}

function createFoodRepository(options = {}) {
  const dataSource = options.dataSource || config.dataSource;
  const database = options.database;

  function getDatabase() {
    return database || require("../config/database");
  }

  async function getFoods() {
    if (dataSource === "memory") {
      return memoryData.getFoods();
    }

    const foods = await getDatabase().food.findMany();
    return foods.map(formatFood);
  }

  async function findFoodById(foodId) {
    if (dataSource === "memory") {
      return memoryData.findFoodById(foodId);
    }

    const food = await getDatabase().food.findUnique({
      where: { id: foodId },
    });

    return food ? formatFood(food) : null;
  }

  async function createFood(foodData) {
    if (dataSource === "memory") {
      const food = {
        id: memoryData.getNextFoodId(),
        ...foodData,
      };

      memoryData.addFood(food);
      return food;
    }

    const food = await getDatabase().food.create({
      data: {
        ...foodData,
        expiryDate: getDateFromDateString(foodData.expiryDate),
      },
    });

    return formatFood(food);
  }

  async function updateFood(foodId, foodData) {
    if (dataSource === "memory") {
      const food = memoryData.findFoodById(foodId);
      Object.assign(food, foodData);
      return food;
    }

    const data = { ...foodData };

    if (data.expiryDate) {
      data.expiryDate = getDateFromDateString(data.expiryDate);
    }

    const food = await getDatabase().food.update({
      where: { id: foodId },
      data,
    });

    return formatFood(food);
  }

  async function deleteFood(foodId) {
    if (dataSource === "memory") {
      const foodIndex = memoryData.findFoodIndexById(foodId);
      return memoryData.deleteFoodByIndex(foodIndex);
    }

    const food = await getDatabase().food.delete({
      where: { id: foodId },
    });

    return formatFood(food);
  }

  async function disconnect() {
    if (dataSource === "database") {
      await getDatabase().$disconnect();
    }
  }

  async function updateFoodStatus(foodId, itemStatus) {
    return updateFood(foodId, { itemStatus });
  }

  return {
    createFood,
    deleteFood,
    disconnect,
    findFoodById,
    getFoods,
    updateFood,
    updateFoodStatus,
  };
}

module.exports = createFoodRepository();
module.exports.createFoodRepository = createFoodRepository;
