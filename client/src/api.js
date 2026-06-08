async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Something went wrong");
  }

  return body;
}

export function getFoods(query = "") {
  return apiRequest(`/api/foods${query}`);
}

export function getFoodStats() {
  return apiRequest("/api/foods/stats");
}

export function createFood(food) {
  return apiRequest("/api/foods", {
    method: "POST",
    body: JSON.stringify(food),
  });
}

export function updateFood(foodId, food) {
  return apiRequest(`/api/foods/${foodId}`, {
    method: "PATCH",
    body: JSON.stringify(food),
  });
}

export function updateFoodStatus(foodId, status) {
  const endpoint = status === "CONSUMED" ? "consume" : "waste";

  return apiRequest(`/api/foods/${foodId}/${endpoint}`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export function deleteFood(foodId) {
  return apiRequest(`/api/foods/${foodId}`, {
    method: "DELETE",
  });
}
