import { AlertTriangle, CheckCircle2, Clock3, Trash2 } from "lucide-react";

const summaryItems = [
  {
    key: "active",
    label: "Active",
    icon: CheckCircle2,
    className: "summary-item--active",
  },
  {
    key: "expiring",
    label: "Expiring soon",
    icon: Clock3,
    className: "summary-item--warning",
  },
  {
    key: "expired",
    label: "Expired",
    icon: AlertTriangle,
    className: "summary-item--expired",
  },
  {
    key: "wasted",
    label: "Wasted",
    icon: Trash2,
    className: "summary-item--wasted",
  },
];

function Summary({ stats }) {
  const values = {
    active: stats?.itemStatusCounts?.ACTIVE ?? 0,
    expiring: stats?.expiryStatusCounts?.EXPIRING_SOON ?? 0,
    expired: stats?.expiryStatusCounts?.EXPIRED ?? 0,
    wasted: stats?.itemStatusCounts?.WASTED ?? 0,
  };

  return (
    <section className="summary-grid" aria-label="Food inventory summary">
      {summaryItems.map(({ key, label, icon: Icon, className }) => (
        <div className={`summary-item ${className}`} key={key}>
          <div className="summary-icon" aria-hidden="true">
            <Icon size={18} />
          </div>
          <div>
            <strong>{values[key]}</strong>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Summary;
