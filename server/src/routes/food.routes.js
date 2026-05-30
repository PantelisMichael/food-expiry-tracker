const express = require("express");

const router = express.Router();

const EXPIRING_SOON_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
  },
  {
    id: 2,
    name: "Apples",
    category: "Fruit",
    quantity: 6,
    unit: "pieces",
    location: "Counter",
    expiryDate: "2026-06-05",
  },
  {
    id: 3,
    name: "Chicken Breast",
    category: "Meat",
    quantity: 500,
    unit: "grams",
    location: "Freezer",
    expiryDate: "2026-05-30",
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

  if (!name || !expiryDate) {
    return res.status(400).json({
      error: "Name and expiryDate are required",
    });
  }

  const newFood = {
    id: nextFoodId,
    name,
    category: category || "Uncategorized",
    quantity: quantity || 1,
    unit: unit || "item",
    location: location || "Unknown",
    expiryDate,
  };

  foods.push(newFood);
  nextFoodId += 1;

  res.status(201).json(addExpiryStatus(newFood));
});

module.exports = router;
