import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { categoryApi } from "../../api";
import { slugify } from "../../format";

const EMPTY_FORM = { name: "", slug: "", description: "" };

export default function Categories() {
  const showToast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    categoryApi.list()
      .then(setCategories)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(""); setEditing({}); };
  const openEdit = c => { setForm({ name: c.name, slug: c.slug, description: c.description || "" }); setError(""); setEditing(c); };
  const closeModal = () => { setEditing(null); setSaving(false); };

  const submit = async e => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim() || null
      };
      if (editing?.id) {
        const updated = await categoryApi.update(editing.id, payload);
        setCategories(x => x.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        showToast("Đã cập nhật danh mục");
      } else {
        const created = await categoryApi.create(payload);
        setCategories(x => [...x, { ...created, productCount: 0 }]);
        showToast("Đã thêm danh mục mới");
      }
      closeModal();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await categoryApi.remove(toDelete.id);
      setCategories(x => x.filter(c => c.id !== toDelete.id));
      showToast("Đã xóa danh mục");
      setToDelete(null);
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div><h2>Danh mục</h2><p>{categories.length} danh mục</p></div>
        <div className="admin-actions">
          <button className="primary small" onClick={openCreate}><Plus size={16} /> Thêm danh mục</button>
        </div>
      </div>

      <div className="data-table cat-table">
        <div className="data-table-head"><span>Tên danh mục</span><span>Slug</span><span>Số sản phẩm</span><span></span></div>
        {loading && <p className="muted">Đang tải...</p>}
        {!loading && categories.length === 0 && <p className="muted">Chưa có danh mục nào.</p>}
        {categories.map(c => (
          <div className="data-table-row" key={c.id}>
            <span className="cell-main"><b>{c.name}</b></span>
            <span className="muted">{c.slug}</span>
            <span>{c.productCount ?? 0} sản phẩm</span>
            <span className="row-actions">
              <button className="icon-btn-sm" onClick={() => openEdit(c)} title="Sửa"><Pencil size={15} /></button>
              <button className="icon-btn-sm danger" onClick={() => setToDelete(c)} title="Xóa"><Trash2 size={15} /></button>
            </span>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? "Sửa danh mục" : "Thêm danh mục mới"} onClose={closeModal} width="480px">
          <form onSubmit={submit} className="form-grid">
            <label className="span-2">Tên danh mục<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label className="span-2">Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="tự tạo từ tên nếu để trống" /></label>
            <label className="span-2">Mô tả<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            {error && <div className="error-box span-2">{error}</div>}
            <div className="modal-actions span-2">
              <button type="button" className="btn-outline" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="primary" disabled={saving}>{saving ? "Đang lưu..." : editing.id ? "Lưu thay đổi" : "Thêm danh mục"}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Xóa danh mục"
          message={`Bạn có chắc muốn xóa danh mục "${toDelete.name}"?`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
