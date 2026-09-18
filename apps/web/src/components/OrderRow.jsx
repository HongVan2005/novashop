import React from "react";
import { money } from "../format";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function OrderRow({ o, onStatus }) {
  return (
    <div className="order">
      <span className="order-icon">📦</span>
      <div>
        <b>{o.code}</b>
        <span>{o.user?.name || "Khách"} · {new Date(o.createdAt).toLocaleString("vi-VN")}</span>
      </div>
      <strong>{money(o.total)}</strong>
      <select value={o.status} onChange={e => onStatus(o.id, e.target.value)}>
        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
