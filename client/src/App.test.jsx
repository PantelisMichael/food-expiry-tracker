import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFood,
  deleteFood,
  getFoods,
  getFoodStats,
  updateFood,
  updateFoodStatus,
} from "./api";
import App from "./App";

vi.mock("./api", () => ({
  createFood: vi.fn(),
  deleteFood: vi.fn(),
  getFoods: vi.fn(),
  getFoodStats: vi.fn(),
  updateFood: vi.fn(),
  updateFoodStatus: vi.fn(),
}));

const milk = {
  category: "Dairy",
  daysUntilExpiry: 5,
  expiryDate: "2099-12-31",
  id: 1,
  itemStatus: "ACTIVE",
  location: "Fridge",
  name: "Milk",
  quantity: 1,
  status: "SAFE",
  unit: "carton",
};

const stats = {
  expiryStatusCounts: {
    EXPIRED: 1,
    EXPIRING_SOON: 2,
    SAFE: 3,
  },
  itemStatusCounts: {
    ACTIVE: 4,
    CONSUMED: 5,
    WASTED: 6,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  createFood.mockResolvedValue({});
  deleteFood.mockResolvedValue({});
  getFoods.mockResolvedValue([milk]);
  getFoodStats.mockResolvedValue(stats);
  updateFood.mockResolvedValue({});
  updateFoodStatus.mockResolvedValue({});
});

async function renderLoadedApp() {
  render(<App />);
  expect(await screen.findByRole("heading", { name: "Milk" })).toBeInTheDocument();
}

describe("App", () => {
  it("loads active foods and summary statistics", async () => {
    await renderLoadedApp();

    expect(getFoods).toHaveBeenCalledWith("?itemStatus=ACTIVE&sort=expiryDate&order=asc");
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("reloads foods when search and status filters change", async () => {
    const user = userEvent.setup();
    await renderLoadedApp();

    await user.type(screen.getByPlaceholderText("Search foods or categories"), "milk");

    await waitFor(() => {
      expect(getFoods).toHaveBeenLastCalledWith(
        "?search=milk&itemStatus=ACTIVE&sort=expiryDate&order=asc",
      );
    });

    await user.click(screen.getByRole("tab", { name: "consumed" }));

    await waitFor(() => {
      expect(getFoods).toHaveBeenLastCalledWith(
        "?search=milk&itemStatus=CONSUMED&sort=expiryDate&order=asc",
      );
    });
  });

  it("adds a food and reloads the inventory", async () => {
    const user = userEvent.setup();
    await renderLoadedApp();

    await user.click(screen.getAllByRole("button", { name: "Add food" })[0]);

    const dialog = screen.getByRole("dialog", { name: "Add food" });
    await user.type(within(dialog).getByLabelText("Food name"), "Yogurt");
    await user.type(within(dialog).getByLabelText("Category"), "Dairy");
    await user.type(within(dialog).getByLabelText("Location"), "Fridge");
    await user.type(within(dialog).getByLabelText("Unit"), "cups");
    await user.type(within(dialog).getByLabelText("Expiry date"), "2099-12-31");
    await user.click(within(dialog).getByRole("button", { name: "Add food" }));

    expect(createFood).toHaveBeenCalledWith({
      category: "Dairy",
      expiryDate: "2099-12-31",
      location: "Fridge",
      name: "Yogurt",
      quantity: 1,
      unit: "cups",
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(getFoods).toHaveBeenCalledTimes(2);
    });
  });

  it("marks a food as consumed and reloads the inventory", async () => {
    const user = userEvent.setup();
    await renderLoadedApp();

    await user.click(screen.getByRole("button", { name: "Consumed" }));

    expect(updateFoodStatus).toHaveBeenCalledWith(1, "CONSUMED");
    await waitFor(() => expect(getFoods).toHaveBeenCalledTimes(2));
  });

  it("deletes a food after confirmation", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderLoadedApp();

    await user.click(screen.getByRole("button", { name: "Delete food" }));

    expect(window.confirm).toHaveBeenCalledWith("Delete Milk?");
    expect(deleteFood).toHaveBeenCalledWith(1);
    await waitFor(() => expect(getFoods).toHaveBeenCalledTimes(2));
  });

  it("shows an error when inventory loading fails", async () => {
    getFoods.mockRejectedValue(new Error("Backend is unavailable"));

    render(<App />);

    expect(await screen.findByText("Backend is unavailable")).toBeInTheDocument();
  });
});
