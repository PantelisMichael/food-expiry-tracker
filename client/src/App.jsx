import { useCallback, useEffect, useState } from "react";
import { Filter, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import {
  createFood,
  deleteFood,
  getFoods,
  getFoodStats,
  updateFood,
  updateFoodStatus,
} from "./api";
import FoodForm from "./components/FoodForm";
import FoodList from "./components/FoodList";
import Summary from "./components/Summary";

const initialFilters = {
  search: "",
  status: "",
  itemStatus: "ACTIVE",
  sort: "expiryDate",
  order: "asc",
};

function App() {
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formFood, setFormFood] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });

    try {
      const [foodList, foodStats] = await Promise.all([
        getFoods(`?${query.toString()}`),
        getFoodStats(),
      ]);
      setFoods(foodList);
      setStats(foodStats);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = window.setTimeout(loadData, 200);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function openAddForm() {
    setFormFood(null);
    setIsFormOpen(true);
  }

  function openEditForm(food) {
    setFormFood(food);
    setIsFormOpen(true);
  }

  async function saveFood(foodData) {
    setIsSaving(true);

    try {
      if (formFood) {
        await updateFood(formFood.id, foodData);
      } else {
        await createFood(foodData);
      }

      setIsFormOpen(false);
      await loadData();
    } finally {
      setIsSaving(false);
    }
  }

  async function changeFoodStatus(foodId, status) {
    setActionId(foodId);
    setError("");

    try {
      await updateFoodStatus(foodId, status);
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActionId(null);
    }
  }

  async function removeFood(food) {
    const confirmed = window.confirm(`Delete ${food.name}?`);
    if (!confirmed) return;

    setActionId(food.id);
    setError("");

    try {
      await deleteFood(food.id);
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              FE
            </div>
            <div>
              <span>Home inventory</span>
              <h1>Food Expiry Tracker</h1>
            </div>
          </div>
          <button className="button button--primary desktop-add-button" onClick={openAddForm}>
            <Plus size={18} />
            Add food
          </button>
        </div>
      </header>

      <main className="main-content">
        <Summary stats={stats} />

        <section className="inventory-section">
          <div className="section-heading">
            <div>
              <span className="section-label">Inventory</span>
              <h2>Food items</h2>
            </div>
            <button
              className="icon-button"
              disabled={isLoading}
              onClick={loadData}
              title="Refresh food items"
              type="button"
            >
              <RefreshCw className={isLoading ? "spin" : ""} size={18} />
            </button>
          </div>

          <div className="inventory-tabs" role="tablist">
            {["ACTIVE", "CONSUMED", "WASTED"].map((status) => (
              <button
                aria-selected={filters.itemStatus === status}
                className={filters.itemStatus === status ? "active" : ""}
                key={status}
                onClick={() => setFilters((current) => ({ ...current, itemStatus: status }))}
                role="tab"
                type="button"
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="filter-bar">
            <label className="search-field">
              <Search aria-hidden="true" size={18} />
              <input
                name="search"
                onChange={updateFilter}
                placeholder="Search foods or categories"
                value={filters.search}
              />
            </label>

            <label className="select-field">
              <Filter aria-hidden="true" size={17} />
              <select name="status" onChange={updateFilter} value={filters.status}>
                <option value="">All expiry states</option>
                <option value="EXPIRING_SOON">Expiring soon</option>
                <option value="SAFE">Safe</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </label>

            <label className="select-field">
              <SlidersHorizontal aria-hidden="true" size={17} />
              <select name="sort" onChange={updateFilter} value={filters.sort}>
                <option value="expiryDate">Expiry date</option>
                <option value="name">Food name</option>
              </select>
            </label>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {isLoading ? (
            <div className="loading-state">
              <RefreshCw className="spin" size={22} />
              <span>Loading inventory...</span>
            </div>
          ) : (
            <FoodList
              actionId={actionId}
              foods={foods}
              onDelete={removeFood}
              onEdit={openEditForm}
              onStatusChange={changeFoodStatus}
            />
          )}
        </section>
      </main>

      <button className="mobile-add-button" onClick={openAddForm} title="Add food" type="button">
        <Plus size={22} />
      </button>

      {isFormOpen && (
        <FoodForm
          food={formFood}
          isSaving={isSaving}
          onClose={() => setIsFormOpen(false)}
          onSubmit={saveFood}
        />
      )}
    </div>
  );
}

export default App;
