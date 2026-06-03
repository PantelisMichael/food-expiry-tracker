const EXPIRING_SOON_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const VALID_EXPIRY_STATUSES = ["SAFE", "EXPIRING_SOON", "EXPIRED"];
const VALID_ITEM_STATUSES = ["ACTIVE", "CONSUMED", "WASTED"];
const VALID_SORT_FIELDS = ["expiryDate", "name"];
const VALID_SORT_ORDERS = ["asc", "desc"];

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

function getDaysUntilExpiry(expiryDate) {
  const today = getTodayDateOnly();
  const expiry = getDateFromDateString(expiryDate);

  return Math.floor((expiry - today) / MS_PER_DAY);
}

function getExpiryStatusFromDays(daysUntilExpiry) {
  if (daysUntilExpiry < 0) {
    return "EXPIRED";
  }

  if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
    return "EXPIRING_SOON";
  }

  return "SAFE";
}

function addExpiryStatus(food) {
  const daysUntilExpiry = getDaysUntilExpiry(food.expiryDate);

  return {
    ...food,
    daysUntilExpiry,
    status: getExpiryStatusFromDays(daysUntilExpiry),
  };
}

function sortFoodsByExpiryDate(foodList) {
  return [...foodList].sort((firstFood, secondFood) => {
    const firstExpiryDate = getDateFromDateString(firstFood.expiryDate);
    const secondExpiryDate = getDateFromDateString(secondFood.expiryDate);

    return firstExpiryDate - secondExpiryDate;
  });
}

function sortFoodsByName(foodList) {
  return [...foodList].sort((firstFood, secondFood) => {
    return firstFood.name.localeCompare(secondFood.name);
  });
}

function sortFoods(foodList, sortField, sortOrder) {
  let sortedFoods = [...foodList];

  if (sortField === "expiryDate") {
    sortedFoods = sortFoodsByExpiryDate(foodList);
  }

  if (sortField === "name") {
    sortedFoods = sortFoodsByName(foodList);
  }

  if (sortOrder === "desc") {
    sortedFoods.reverse();
  }

  return sortedFoods;
}

function matchesText(value, searchTerm) {
  return value.toLowerCase().includes(searchTerm.toLowerCase());
}

function getFoodsWithExpiryStatus(foodList) {
  return foodList.map(addExpiryStatus);
}

function getUseFirstFoods(foodList) {
  const activeFoods = getFoodsWithExpiryStatus(foodList).filter((food) => {
    return food.itemStatus === "ACTIVE" && food.status !== "EXPIRED";
  });

  return sortFoodsByExpiryDate(activeFoods);
}

function getFoodStats(foodList) {
  const foodsWithStatus = getFoodsWithExpiryStatus(foodList);
  const stats = {
    total: foodsWithStatus.length,
    useFirstCount: getUseFirstFoods(foodList).length,
    itemStatusCounts: {
      ACTIVE: 0,
      CONSUMED: 0,
      WASTED: 0,
    },
    expiryStatusCounts: {
      SAFE: 0,
      EXPIRING_SOON: 0,
      EXPIRED: 0,
    },
    categoryCounts: {},
    locationCounts: {},
  };

  foodsWithStatus.forEach((food) => {
    stats.itemStatusCounts[food.itemStatus] += 1;
    stats.expiryStatusCounts[food.status] += 1;
    stats.categoryCounts[food.category] = (stats.categoryCounts[food.category] || 0) + 1;
    stats.locationCounts[food.location] = (stats.locationCounts[food.location] || 0) + 1;
  });

  return stats;
}

function getFoodIdFromRequest(req) {
  const foodId = Number(req.params.id);

  if (!Number.isInteger(foodId) || foodId <= 0) {
    return null;
  }

  return foodId;
}

module.exports = {
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
};
