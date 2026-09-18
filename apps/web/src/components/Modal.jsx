import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, subtitle, onClose, children, width }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-card" style={width ? { maxWidth: width } : undefined} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="round" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
