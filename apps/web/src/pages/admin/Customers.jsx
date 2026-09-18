import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { customerApi } from "../../api";

const EMPTY_FORM = { name: "", email: "", password: "123456", isActive: true };

export default function Customers() {
  const showToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    customerApi.list()
      .then(setCustomers)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(""); setEditing({}); };
  const openEdit = c => { setForm({ name: c.name, email: c.email, password: "", isActive: c.isActive }); setError(""); setEditing(c); };
  const closeModal = () => { setEditing(null); setSaving(false); };

  const submit = async e => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing?.id) {
        const updated = await customerApi.update(editing.id, {
          name: form.name.trim(), email: form.email.trim(), isActive: form.isActive
        });
        setCustomers(x => x.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        showToast("Đã cập nhật khách hàng");
      } else {
        const created = await customerApi.create({
          name: form.name.trim(), email: form.email.trim(), password: form.password || "123456"
        });
        setCustomers(x => [{ ...created, orderCount: 0 }, ...x]);
        showToast("Đã thêm khách hàng mới");
      }
      closeModal();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await customerApi.remove(toDelete.id);
      setCustomers(x => x.map(c => c.id === toDelete.id ? { ...c, isActive: false } : c));
      showToast("Đã vô hiệu hóa khách hàng");
      setToDelete(null);
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div><h2>Khách hàng</h2><p>{customers.length} tài khoản</p></div>
        <div className="admin-actions">
          <button className="primary small" onClick={openCreate}><Plus size={16} /> Thêm khách hàng</button>
        </div>
      </div>

      <div className="data-table cust-table">
        <div className="data-table-head"><span>Khách hàng</span><span>Email</span><span>Đơn hàng</span><span>Trạng thái</span><span></span></div>
        {loading && <p className="muted">Đang tải...</p>}
        {!loading && customers.length === 0 && <p className="muted">Chưa có khách hàng nào.</p>}
        {customers.map(c => (
          <div className="data-table-row" key={c.id}>
            <span className="cell-main"><span className="avatar sm">{c.name.slice(0, 2).toUpperCase()}</span><b>{c.name}</b></span>
            <span className="muted">{c.email}</span>
            <span>{c.orderCount ?? 0} đơn</span>
            <span><span className={`status ${c.isActive ? "" : "s3"}`}>{c.isActive ? "Hoạt động" : "Đã khóa"}</span></span>
            <span className="row-actions">
              <button className="icon-btn-sm" onClick={() => openEdit(c)} title="Sửa"><Pencil size={15} /></button>
              <button className="icon-btn-sm danger" onClick={() => setToDelete(c)} title="Khóa tài khoản" disabled={!c.isActive}><Trash2 size={15} /></button>
            </span>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? "Sửa khách hàng" : "Thêm khách hàng mới"} onClose={closeModal} width="480px">
          <form onSubmit={submit} className="form-grid">
            <label className="span-2">Họ tên<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label className="span-2">Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
            {!editing.id && (
              <label className="span-2">Mật khẩu ban đầu<input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mặc định 123456" /></label>
            )}
            {editing.id && (
              <label className="check span-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Tài khoản đang hoạt động</label>
            )}
            {error && <div className="error-box span-2">{error}</div>}
            <div className="modal-actions span-2">
              <button type="button" className="btn-outline" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="primary" disabled={saving}>{saving ? "Đang lưu..." : editing.id ? "Lưu thay đổi" : "Thêm khách hàng"}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Khóa tài khoản khách hàng"
          message={`Khách hàng "${toDelete.name}" sẽ không thể đăng nhập sau khi bị khóa. Bạn có chắc chắn?`}
          confirmLabel="Khóa tài khoản"
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
