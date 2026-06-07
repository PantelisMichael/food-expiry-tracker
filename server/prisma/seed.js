const prisma = require("../src/config/database");

function getDateAfterDays(days) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);

  return date;
}

const seedFoods = [
  {
    name: "Milk",
    category: "Dairy",
    quantity: 1,
    unit: "carton",
    location: "Fridge",
    expiryDate: getDateAfterDays(2),
  },
  {
    name: "Apples",
    category: "Fruit",
    quantity: 6,
    unit: "pieces",
    location: "Counter",
    expiryDate: getDateAfterDays(7),
  },
  {
    name: "Chicken Breast",
    category: "Meat",
    quantity: 500,
    unit: "grams",
    location: "Freezer",
    expiryDate: getDateAfterDays(14),
  },
];

async function seedDatabase() {
  const foodCount = await prisma.food.count();

  if (foodCount > 0) {
    console.log("Food seed skipped because the database already contains food items.");
    return;
  }

  await prisma.food.createMany({
    data: seedFoods,
  });

  console.log(`Created ${seedFoods.length} food items.`);
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
