import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({ title, message, confirmLabel = "Xóa", danger = true, loading, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} width="420px">
      <div className="confirm-body">
        <div className="confirm-icon"><AlertTriangle size={22} /></div>
        <p>{message}</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
        <button
          type="button"
          className={danger ? "btn-danger" : "primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
