import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFood,
  getFoods,
  getFoodStats,
  updateFoodStatus,
} from "./api";

function mockJsonResponse(body, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: async () => body,
      ok,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API helpers", () => {
  it("requests foods with the provided query", async () => {
    const foods = [{ id: 1, name: "Milk" }];
    mockJsonResponse(foods);

    const result = await getFoods("?search=milk");

    expect(fetch).toHaveBeenCalledWith("/api/foods?search=milk", {
      headers: { "Content-Type": "application/json" },
    });
    expect(result).toEqual(foods);
  });

  it("requests food statistics", async () => {
    const stats = { total: 3 };
    mockJsonResponse(stats);

    await expect(getFoodStats()).resolves.toEqual(stats);
    expect(fetch).toHaveBeenCalledWith("/api/foods/stats", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("sends new food as JSON", async () => {
    const food = { name: "Yogurt", expiryDate: "2099-12-31" };
    mockJsonResponse({ id: 4, ...food });

    await createFood(food);

    expect(fetch).toHaveBeenCalledWith("/api/foods", {
      body: JSON.stringify(food),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  });

  it("uses the correct endpoint when food is consumed or wasted", async () => {
    mockJsonResponse({});

    await updateFoodStatus(7, "CONSUMED");
    await updateFoodStatus(8, "WASTED");

    expect(fetch).toHaveBeenNthCalledWith(1, "/api/foods/7/consume", {
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/foods/8/waste", {
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
  });

  it("throws the API error message when a request fails", async () => {
    mockJsonResponse({ error: "Food item not found" }, false);

    await expect(getFoods()).rejects.toThrow("Food item not found");
  });
});
