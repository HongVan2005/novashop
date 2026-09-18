import React from "react";

export default function StatCard({ title, value, change, icon }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{title}</span>
        <h2>{value}</h2>
        <small>↗ {change}</small>
      </div>
    </div>
  );
}
