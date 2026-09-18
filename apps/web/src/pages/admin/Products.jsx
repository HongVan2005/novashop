import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { productApi, categoryApi } from "../../api";
import { money, slugify } from "../../format";

const EMPTY_FORM = {
  name: "", slug: "", category: "", description: "",
  price: "", oldPrice: "", emoji: "", tag: "", stock: "0", isActive: true
};

export default function Products() {
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null); // null = closed, {} = new, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([productApi.list(), categoryApi.list()])
      .then(([p, c]) => { setProducts(p.items); setCategories(c); })
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, category: categories[0]?.name || "" });
    setErrors("");
    setEditing({});
  };

  const openEdit = p => {
    setForm({
      name: p.name, slug: p.slug, category: p.category, description: p.description || "",
      price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      emoji: p.emoji || "", tag: p.tag || "", stock: String(p.stock), isActive: p.isActive
    });
    setErrors("");
    setEditing(p);
  };

  const closeModal = () => { setEditing(null); setSaving(false); };

  const submit = async e => {
    e.preventDefault();
    setSaving(true); setErrors("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        category: form.category,
        description: form.description.trim() || undefined,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        emoji: form.emoji.trim() || undefined,
        tag: form.tag.trim() || undefined,
        stock: Number(form.stock),
        isActive: form.isActive
      };

      if (editing?.id) {
        const updated = await productApi.update(editing.id, payload);
        setProducts(x => x.map(p => p.id === updated.id ? updated : p));
        showToast("Đã cập nhật sản phẩm");
      } else {
        const created = await productApi.create(payload);
        setProducts(x => [created, ...x]);
        showToast("Đã thêm sản phẩm mới");
      }
      closeModal();
    } catch (e) { setErrors(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await productApi.remove(toDelete.id);
      setProducts(x => x.filter(p => p.id !== toDelete.id));
      showToast("Đã xóa sản phẩm");
      setToDelete(null);
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="panel">
      <div className="panel-head">
        <div><h2>Sản phẩm</h2><p>{products.length} sản phẩm</p></div>
        <div className="admin-actions">
          <div className="search small-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." /></div>
          <button className="primary small" onClick={openCreate}><Plus size={16} /> Thêm sản phẩm</button>
        </div>
      </div>

      <div className="data-table">
        <div className="data-table-head">
          <span>Sản phẩm</span><span>Danh mục</span><span>Giá</span><span>Tồn kho</span><span>Trạng thái</span><span></span>
        </div>
        {loading && <p className="muted">Đang tải...</p>}
        {!loading && filtered.length === 0 && <p className="muted">Không có sản phẩm nào.</p>}
        {filtered.map(p => (
          <div className="data-table-row" key={p.id}>
            <span className="cell-main"><span className="mini">{p.emoji || "📦"}</span><b>{p.name}</b></span>
            <span>{p.category}</span>
            <span>{money(p.price)}</span>
            <span>{p.stock}</span>
            <span><span className={`status ${p.isActive ? "" : "s3"}`}>{p.isActive ? "Đang bán" : "Đã ẩn"}</span></span>
            <span className="row-actions">
              <button className="icon-btn-sm" onClick={() => openEdit(p)} title="Sửa"><Pencil size={15} /></button>
              <button className="icon-btn-sm danger" onClick={() => setToDelete(p)} title="Xóa"><Trash2 size={15} /></button>
            </span>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? "Sửa sản phẩm" : "Thêm sản phẩm mới"} onClose={closeModal} width="620px">
          <form onSubmit={submit} className="form-grid">
            <label>Tên sản phẩm<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label>Slug (URL)<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="tự tạo từ tên nếu để trống" /></label>
            <label>Danh mục
              <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="" disabled>Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label>Nhãn (tag)<input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="Hot, -20%, Mới..." /></label>
            <label>Giá bán (đ)<input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
            <label>Giá gốc (đ)<input type="number" min="0" value={form.oldPrice} onChange={e => setForm({ ...form, oldPrice: e.target.value })} /></label>
            <label>Tồn kho<input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></label>
            <label>Emoji minh họa<input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🎧" /></label>
            <label className="span-2">Mô tả<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label className="check span-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Đang bán (hiển thị ở cửa hàng)</label>

            {errors && <div className="error-box span-2">{errors}</div>}

            <div className="modal-actions span-2">
              <button type="button" className="btn-outline" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="primary" disabled={saving}>{saving ? "Đang lưu..." : editing.id ? "Lưu thay đổi" : "Thêm sản phẩm"}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Xóa sản phẩm"
          message={`Bạn có chắc muốn xóa "${toDelete.name}"? Sản phẩm sẽ bị ẩn khỏi cửa hàng.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
