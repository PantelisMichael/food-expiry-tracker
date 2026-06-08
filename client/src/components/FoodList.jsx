import {
  Apple,
  Check,
  Drumstick,
  Milk,
  Package,
  Pencil,
  Trash2,
  Wheat,
} from "lucide-react";

function getCategoryIcon(category) {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("dairy")) return Milk;
  if (normalizedCategory.includes("fruit") || normalizedCategory.includes("vegetable")) return Apple;
  if (normalizedCategory.includes("meat")) return Drumstick;
  if (normalizedCategory.includes("grain")) return Wheat;

  return Package;
}

function getExpiryText(food) {
  if (food.daysUntilExpiry < 0) {
    const expiredDays = Math.abs(food.daysUntilExpiry);
    return `Expired ${expiredDays} ${expiredDays === 1 ? "day" : "days"} ago`;
  }

  if (food.daysUntilExpiry === 0) return "Expires today";
  if (food.daysUntilExpiry === 1) return "Expires tomorrow";

  return `Expires in ${food.daysUntilExpiry} days`;
}

function FoodList({ actionId, foods, onDelete, onEdit, onStatusChange }) {
  if (foods.length === 0) {
    return (
      <div className="empty-state">
        <Package aria-hidden="true" size={28} />
        <h3>No food items found</h3>
        <p>Try changing the current filters or add a new item.</p>
      </div>
    );
  }

  return (
    <section className="food-grid" aria-label="Food inventory">
      {foods.map((food) => {
        const CategoryIcon = getCategoryIcon(food.category);
        const isWorking = actionId === food.id;

        return (
          <article className={`food-card food-card--${food.status.toLowerCase()}`} key={food.id}>
            <div className="food-card-main">
              <div className="category-icon" aria-hidden="true">
                <CategoryIcon size={22} />
              </div>
              <div className="food-content">
                <div className="food-title-row">
                  <div>
                    <h3>{food.name}</h3>
                    <p>
                      {food.quantity} {food.unit} · {food.location}
                    </p>
                  </div>
                  <span className={`status-badge status-badge--${food.status.toLowerCase()}`}>
                    {food.status.replace("_", " ")}
                  </span>
                </div>

                <div className="food-meta">
                  <span>{food.category}</span>
                  <span className="expiry-text">{getExpiryText(food)}</span>
                </div>
              </div>
            </div>

            <footer className="food-actions">
              {food.itemStatus === "ACTIVE" && (
                <>
                  <button
                    className="action-button action-button--consume"
                    disabled={isWorking}
                    onClick={() => onStatusChange(food.id, "CONSUMED")}
                    type="button"
                  >
                    <Check size={17} />
                    Consumed
                  </button>
                  <button
                    className="action-button action-button--waste"
                    disabled={isWorking}
                    onClick={() => onStatusChange(food.id, "WASTED")}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Wasted
                  </button>
                </>
              )}

              {food.itemStatus !== "ACTIVE" && (
                <span className={`item-state item-state--${food.itemStatus.toLowerCase()}`}>
                  {food.itemStatus === "CONSUMED" ? <Check size={16} /> : <Trash2 size={15} />}
                  {food.itemStatus.toLowerCase()}
                </span>
              )}

              <div className="food-icon-actions">
                <button
                  className="icon-button"
                  disabled={isWorking}
                  onClick={() => onEdit(food)}
                  title="Edit food"
                  type="button"
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="icon-button icon-button--danger"
                  disabled={isWorking}
                  onClick={() => onDelete(food)}
                  title="Delete food"
                  type="button"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </section>
  );
}

export default FoodList;
