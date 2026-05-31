const express = require("express");

const router = express.Router();

const EXPIRING_SOON_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const VALID_EXPIRY_STATUSES = ["SAFE", "EXPIRING_SOON", "EXPIRED"];

// Temporary in-memory food data.
// This will reset whenever the server restarts and will later be replaced by a database.
const foods = [
  {
    id: 1,
    name: "Milk",
    category: "Dairy",
    quantity: 1,
    unit: "carton",
    location: "Fridge",
    expiryDate: "2026-06-01",
    itemStatus: "ACTIVE",
  },
  {
    id: 2,
    name: "Apples",
    category: "Fruit",
    quantity: 6,
    unit: "pieces",
    location: "Counter",
    expiryDate: "2026-06-05",
    itemStatus: "ACTIVE",
  },
  {
    id: 3,
    name: "Chicken Breast",
    category: "Meat",
    quantity: 500,
    unit: "grams",
    location: "Freezer",
    expiryDate: "2026-05-30",
    itemStatus: "ACTIVE",
  },
];

let nextFoodId = 4;

function getTodayDateOnly() {
  const today = new Date();

  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
}

function getDateFromDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isValidDateString(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = getDateFromDateString(value);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidQuantity(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function getExpiryStatus(expiryDate) {
  const today = getTodayDateOnly();
  const expiry = getDateFromDateString(expiryDate);
  const daysUntilExpiry = Math.floor((expiry - today) / MS_PER_DAY);

  if (daysUntilExpiry < 0) {
    return "EXPIRED";
  }

  if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
    return "EXPIRING_SOON";
  }

  return "SAFE";
}

function addExpiryStatus(food) {
  return {
    ...food,
    status: getExpiryStatus(food.expiryDate),
  };
}

function sortFoodsByExpiryDate(foodList) {
  return [...foodList].sort((firstFood, secondFood) => {
    const firstExpiryDate = getDateFromDateString(firstFood.expiryDate);
    const secondExpiryDate = getDateFromDateString(secondFood.expiryDate);

    return firstExpiryDate - secondExpiryDate;
  });
}

router.get("/api/foods", (req, res) => {
  let foodList = foods.map(addExpiryStatus);

  if (req.query.status && !VALID_EXPIRY_STATUSES.includes(req.query.status)) {
    return res.status(400).json({
      error: "Status must be SAFE, EXPIRING_SOON, or EXPIRED",
    });
  }

  if (req.query.status) {
    foodList = foodList.filter((food) => food.status === req.query.status);
  }

  if (req.query.sort === "expiryDate") {
    foodList = sortFoodsByExpiryDate(foodList);
  }

  res.json(foodList);
});

router.get("/api/foods/:id", (req, res) => {
  const foodId = Number(req.params.id);
  const food = foods.find((item) => item.id === foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  res.json(addExpiryStatus(food));
});

router.post("/api/foods", (req, res) => {
  const { name, category, quantity, unit, location, expiryDate } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(expiryDate)) {
    return res.status(400).json({
      error: "Name and expiryDate are required",
    });
  }

  if (!isValidDateString(expiryDate)) {
    return res.status(400).json({
      error: "expiryDate must be a valid date in YYYY-MM-DD format",
    });
  }

  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return res.status(400).json({
      error: "Quantity must be a positive number",
    });
  }

  const newFood = {
    id: nextFoodId,
    name: name.trim(),
    category: isNonEmptyString(category) ? category.trim() : "Uncategorized",
    quantity: quantity || 1,
    unit: isNonEmptyString(unit) ? unit.trim() : "item",
    location: isNonEmptyString(location) ? location.trim() : "Unknown",
    expiryDate,
    itemStatus: "ACTIVE",
  };

  foods.push(newFood);
  nextFoodId += 1;

  res.status(201).json(addExpiryStatus(newFood));
});

router.patch("/api/foods/:id", (req, res) => {
  const foodId = Number(req.params.id);
  const food = foods.find((item) => item.id === foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  const { name, category, quantity, unit, location, expiryDate } = req.body;

  if (name !== undefined && !isNonEmptyString(name)) {
    return res.status(400).json({
      error: "Name cannot be empty",
    });
  }

  if (expiryDate !== undefined && !isNonEmptyString(expiryDate)) {
    return res.status(400).json({
      error: "Expiry date cannot be empty",
    });
  }

  if (expiryDate !== undefined && !isValidDateString(expiryDate)) {
    return res.status(400).json({
      error: "expiryDate must be a valid date in YYYY-MM-DD format",
    });
  }

  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return res.status(400).json({
      error: "Quantity must be a positive number",
    });
  }

  if (name !== undefined) {
    food.name = name.trim();
  }

  if (category !== undefined) {
    food.category = isNonEmptyString(category) ? category.trim() : "Uncategorized";
  }

  if (quantity !== undefined) {
    food.quantity = quantity;
  }

  if (unit !== undefined) {
    food.unit = isNonEmptyString(unit) ? unit.trim() : "item";
  }

  if (location !== undefined) {
    food.location = isNonEmptyString(location) ? location.trim() : "Unknown";
  }

  if (expiryDate !== undefined) {
    food.expiryDate = expiryDate;
  }

  res.json(addExpiryStatus(food));
});

router.delete("/api/foods/:id", (req, res) => {
  const foodId = Number(req.params.id);
  const foodIndex = foods.findIndex((item) => item.id === foodId);

  if (foodIndex === -1) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  const deletedFood = foods.splice(foodIndex, 1)[0];

  res.json({
    message: "Food item deleted",
    food: addExpiryStatus(deletedFood),
  });
});

router.patch("/api/foods/:id/consume", (req, res) => {
  const foodId = Number(req.params.id);
  const food = foods.find((item) => item.id === foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  food.itemStatus = "CONSUMED";

  res.json(addExpiryStatus(food));
});

router.patch("/api/foods/:id/waste", (req, res) => {
  const foodId = Number(req.params.id);
  const food = foods.find((item) => item.id === foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  food.itemStatus = "WASTED";

  res.json(addExpiryStatus(food));
});

module.exports = router;
