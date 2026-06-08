import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

const emptyForm = {
  name: "",
  category: "",
  quantity: 1,
  unit: "",
  location: "",
  expiryDate: "",
};

function FoodForm({ food, isSaving, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (food) {
      setForm({
        name: food.name,
        category: food.category,
        quantity: food.quantity,
        unit: food.unit,
        location: food.location,
        expiryDate: food.expiryDate,
      });
      return;
    }

    setForm(emptyForm);
  }, [food]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await onSubmit({
        ...form,
        quantity: Number(form.quantity),
      });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="food-form-title"
        aria-modal="true"
        className="food-form-panel"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="form-header">
          <div>
            <span className="section-label">{food ? "Update item" : "New inventory item"}</span>
            <h2 id="food-form-title">{food ? "Edit food" : "Add food"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} title="Close form" type="button">
            <X size={20} />
          </button>
        </header>

        <form className="food-form" onSubmit={handleSubmit}>
          <label className="field field--wide">
            <span>Food name</span>
            <input
              autoFocus
              name="name"
              onChange={updateField}
              placeholder="e.g. Greek yogurt"
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Category</span>
            <input
              list="food-categories"
              name="category"
              onChange={updateField}
              placeholder="e.g. Dairy"
              value={form.category}
            />
            <datalist id="food-categories">
              <option value="Dairy" />
              <option value="Fruit" />
              <option value="Vegetables" />
              <option value="Meat" />
              <option value="Grains" />
              <option value="Prepared food" />
            </datalist>
          </label>

          <label className="field">
            <span>Location</span>
            <input
              list="food-locations"
              name="location"
              onChange={updateField}
              placeholder="e.g. Fridge"
              value={form.location}
            />
            <datalist id="food-locations">
              <option value="Fridge" />
              <option value="Freezer" />
              <option value="Pantry" />
              <option value="Counter" />
            </datalist>
          </label>

          <label className="field">
            <span>Quantity</span>
            <input
              min="0.01"
              name="quantity"
              onChange={updateField}
              required
              step="any"
              type="number"
              value={form.quantity}
            />
          </label>

          <label className="field">
            <span>Unit</span>
            <input
              name="unit"
              onChange={updateField}
              placeholder="e.g. pieces"
              value={form.unit}
            />
          </label>

          <label className="field field--wide">
            <span>Expiry date</span>
            <div className="input-with-icon">
              <CalendarDays aria-hidden="true" size={18} />
              <input
                name="expiryDate"
                onChange={updateField}
                required
                type="date"
                value={form.expiryDate}
              />
            </div>
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="button button--secondary" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button--primary" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : food ? "Save changes" : "Add food"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default FoodForm;
