const express = require("express");
const {
  createFood,
  deleteFood,
  findFoodById,
  getFoods,
  updateFood,
  updateFoodStatus,
} = require("../repositories/food.repository");
const {
  VALID_EXPIRY_STATUSES,
  VALID_ITEM_STATUSES,
  VALID_SORT_FIELDS,
  VALID_SORT_ORDERS,
  addExpiryStatus,
  getFoodIdFromRequest,
  getFoodStats,
  getFoodsWithExpiryStatus,
  getUseFirstFoods,
  isNonEmptyString,
  isValidDateString,
  isValidQuantity,
  matchesText,
  sortFoods,
} = require("../utils/food.utils");

const router = express.Router();

router.get("/api/foods", async (req, res) => {
  let foodList = getFoodsWithExpiryStatus(await getFoods());
  const { search, category, location, status, itemStatus, sort, order = "asc" } = req.query;

  if (status && !VALID_EXPIRY_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Status must be SAFE, EXPIRING_SOON, or EXPIRED",
    });
  }

  if (itemStatus && !VALID_ITEM_STATUSES.includes(itemStatus)) {
    return res.status(400).json({
      error: "itemStatus must be ACTIVE, CONSUMED, or WASTED",
    });
  }

  if (sort && !VALID_SORT_FIELDS.includes(sort)) {
    return res.status(400).json({
      error: "sort must be expiryDate or name",
    });
  }

  if (!VALID_SORT_ORDERS.includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  if (status) {
    foodList = foodList.filter((food) => food.status === status);
  }

  if (itemStatus) {
    foodList = foodList.filter((food) => food.itemStatus === itemStatus);
  }

  if (isNonEmptyString(search)) {
    foodList = foodList.filter((food) => {
      return matchesText(food.name, search) || matchesText(food.category, search);
    });
  }

  if (isNonEmptyString(category)) {
    foodList = foodList.filter((food) => matchesText(food.category, category));
  }

  if (isNonEmptyString(location)) {
    foodList = foodList.filter((food) => matchesText(food.location, location));
  }

  if (sort) {
    foodList = sortFoods(foodList, sort, order);
  }

  res.json(foodList);
});

router.get("/api/foods/use-first", async (req, res) => {
  res.json(getUseFirstFoods(await getFoods()));
});

router.get("/api/foods/stats", async (req, res) => {
  res.json(getFoodStats(await getFoods()));
});

router.get("/api/foods/:id", async (req, res) => {
  const foodId = getFoodIdFromRequest(req);

  if (!foodId) {
    return res.status(400).json({
      error: "Food id must be a positive number",
    });
  }

  const food = await findFoodById(foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  res.json(addExpiryStatus(food));
});

router.post("/api/foods", async (req, res) => {
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

  const newFood = await createFood({
    name: name.trim(),
    category: isNonEmptyString(category) ? category.trim() : "Uncategorized",
    quantity: quantity || 1,
    unit: isNonEmptyString(unit) ? unit.trim() : "item",
    location: isNonEmptyString(location) ? location.trim() : "Unknown",
    expiryDate,
    itemStatus: "ACTIVE",
  });

  res.status(201).json(addExpiryStatus(newFood));
});

router.patch("/api/foods/:id", async (req, res) => {
  const foodId = getFoodIdFromRequest(req);

  if (!foodId) {
    return res.status(400).json({
      error: "Food id must be a positive number",
    });
  }

  const food = await findFoodById(foodId);

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

  const updates = {};

  if (name !== undefined) {
    updates.name = name.trim();
  }

  if (category !== undefined) {
    updates.category = isNonEmptyString(category) ? category.trim() : "Uncategorized";
  }

  if (quantity !== undefined) {
    updates.quantity = quantity;
  }

  if (unit !== undefined) {
    updates.unit = isNonEmptyString(unit) ? unit.trim() : "item";
  }

  if (location !== undefined) {
    updates.location = isNonEmptyString(location) ? location.trim() : "Unknown";
  }

  if (expiryDate !== undefined) {
    updates.expiryDate = expiryDate;
  }

  const updatedFood = await updateFood(foodId, updates);

  res.json(addExpiryStatus(updatedFood));
});

router.delete("/api/foods/:id", async (req, res) => {
  const foodId = getFoodIdFromRequest(req);

  if (!foodId) {
    return res.status(400).json({
      error: "Food id must be a positive number",
    });
  }

  const food = await findFoodById(foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  const deletedFood = await deleteFood(foodId);

  res.json({
    message: "Food item deleted",
    food: addExpiryStatus(deletedFood),
  });
});

router.patch("/api/foods/:id/consume", async (req, res) => {
  const foodId = getFoodIdFromRequest(req);

  if (!foodId) {
    return res.status(400).json({
      error: "Food id must be a positive number",
    });
  }

  const food = await findFoodById(foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  const consumedFood = await updateFoodStatus(foodId, "CONSUMED");

  res.json(addExpiryStatus(consumedFood));
});

router.patch("/api/foods/:id/waste", async (req, res) => {
  const foodId = getFoodIdFromRequest(req);

  if (!foodId) {
    return res.status(400).json({
      error: "Food id must be a positive number",
    });
  }

  const food = await findFoodById(foodId);

  if (!food) {
    return res.status(404).json({
      error: "Food item not found",
    });
  }

  const wastedFood = await updateFoodStatus(foodId, "WASTED");

  res.json(addExpiryStatus(wastedFood));
});

module.exports = router;
