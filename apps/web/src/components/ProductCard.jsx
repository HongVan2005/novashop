import React from "react";
import { Heart, Plus } from "lucide-react";
import { money } from "../format";

export default function ProductCard({ p, onAdd }) {
  return (
    <div className="product-card">
      <div className="product-img">
        <span className="tag">{p.tag || p.category}</span>
        <span className="product-emoji">{p.emoji || "📦"}</span>
        <button className="heart"><Heart size={18} /></button>
      </div>
      <div className="product-info">
        <div className="muted">{p.category}</div>
        <h3>{p.name}</h3>
        <div className="price">
          <b>{money(p.price)}</b>
          {p.oldPrice && <del>{money(p.oldPrice)}</del>}
        </div>
        <button className="add-btn" disabled={p.stock <= 0} onClick={() => onAdd(p)}>
          {p.stock > 0 ? <>Thêm vào giỏ <Plus size={17} /></> : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}
