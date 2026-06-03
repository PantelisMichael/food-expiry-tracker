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

function getFoods() {
  return foods;
}

function getNextFoodId() {
  const id = nextFoodId;
  nextFoodId += 1;

  return id;
}

function addFood(food) {
  foods.push(food);
}

function findFoodById(foodId) {
  return foods.find((item) => item.id === foodId);
}

function findFoodIndexById(foodId) {
  return foods.findIndex((item) => item.id === foodId);
}

function deleteFoodByIndex(foodIndex) {
  return foods.splice(foodIndex, 1)[0];
}

module.exports = {
  addFood,
  deleteFoodByIndex,
  findFoodById,
  findFoodIndexById,
  getFoods,
  getNextFoodId,
};
