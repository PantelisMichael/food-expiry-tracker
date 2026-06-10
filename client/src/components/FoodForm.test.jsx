import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FoodForm from "./FoodForm";

const food = {
  category: "Dairy",
  expiryDate: "2099-12-31",
  location: "Fridge",
  name: "Milk",
  quantity: 1,
  unit: "carton",
};

describe("FoodForm", () => {
  it("loads an existing food and submits the edited values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();

    render(<FoodForm food={food} isSaving={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    expect(screen.getByLabelText("Food name")).toHaveValue("Milk");
    expect(screen.getByLabelText("Expiry date")).toHaveValue("2099-12-31");

    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "2.5");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSubmit).toHaveBeenCalledWith({
      ...food,
      quantity: 2.5,
    });
  });

  it("shows the error returned while saving", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Could not save food"));

    render(<FoodForm food={food} isSaving={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Could not save food")).toBeInTheDocument();
  });
});
