import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, X, ArrowRight, Trash2, Plus, Minus } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useToast } from "../components/Toast";
import { categoryApi, orderApi, productApi, session } from "../api";
import { money } from "../format";

export default function Store() {
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [openCart, setOpenCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ shippingName: "", shippingPhone: "", shippingAddress: "", note: "" });

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(e => showToast(e.message, "error"));
  }, [showToast]);

  useEffect(() => {
    setLoading(true);
    productApi.list({ q: search, category: categoryId }).then(x => setProducts(x.items || []))
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [search, categoryId, showToast]);

  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  const cartCount = cart.reduce((s, x) => s + x.quantity, 0);

  const add = p => setCart(c => {
    const found = c.find(x => x.id === p.id);
    if (found) return c.map(x => x.id === p.id ? { ...x, quantity: Math.min(x.quantity + 1, p.stock) } : x);
    return [...c, { ...p, quantity: 1 }];
  });
  const changeQty = (id, delta) => setCart(c => c.map(x => x.id === id ? { ...x, quantity: Math.max(1, Math.min(x.quantity + delta, x.stock)) } : x));
  const remove = id => setCart(c => c.filter(x => x.id !== id));

  const placeOrder = async e => {
    e.preventDefault();
    if (!session.user) { setOpenCart(false); navToLogin(); return; }
    setSubmitting(true);
    try {
      await orderApi.create({ ...form, items: cart.map(x => ({ productId: x.id, quantity: x.quantity })) });
      setCart([]); setCheckout(false); setOpenCart(false);
      setForm({ shippingName: "", shippingPhone: "", shippingAddress: "", note: "" });
      showToast("Đặt hàng thành công!");
    } catch (e) { showToast(e.message, "error"); }
    finally { setSubmitting(false); }
  };
  const navToLogin = () => { window.location.href = "/login"; };

  return <div>
    <header className="store-header">
      <Link to="/" className="logo"><span>✦</span>NOVA<span className="logo-light">SHOP</span></Link>
      <nav><a href="#products">Sản phẩm</a><a href="#categories">Danh mục</a><a href="#deal">Ưu đãi</a></nav>
      <div className="header-actions">
        <div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm sản phẩm..."/></div>
        <Link to={session.user?.role === "ADMIN" ? "/admin" : "/login"} className="icon-btn"><User size={20}/></Link>
        <button className="cart-btn" onClick={()=>setOpenCart(true)}><ShoppingBag size={20}/><span>{cartCount}</span></button>
      </div>
    </header>

    <section className="hero"><div><span className="eyebrow">BỘ SƯU TẬP 2026</span><h1>Đồ tốt cho<br/><em>cuộc sống tốt hơn.</em></h1><p>Những sản phẩm được tuyển chọn kỹ lưỡng, thiết kế đẹp và giá hợp lý cho phong cách sống hiện đại.</p><button className="primary" onClick={()=>document.getElementById("products")?.scrollIntoView({behavior:"smooth"})}>Khám phá ngay <ArrowRight size={18}/></button></div><div className="hero-art"><div className="circle"></div><div className="floating-card fc1">🎧<b>Aurora</b><small>Premium audio</small></div><div className="floating-card fc2">⌚<b>Nova Watch</b><small>Smart lifestyle</small></div><div className="hero-product">🎧</div></div></section>
    <section className="benefits"><div>⚡ <b>Giao hàng nhanh</b><span>Toàn quốc 1–3 ngày</span></div><div>✓ <b>Đổi trả 7 ngày</b><span>Hoàn tiền dễ dàng</span></div><div>♡ <b>Sản phẩm chính hãng</b><span>Cam kết 100%</span></div><div>◉ <b>Hỗ trợ 24/7</b><span>Luôn sẵn sàng giúp bạn</span></div></section>

    <section className="category-section" id="categories"><div className="section-head"><div><span className="eyebrow">KHÁM PHÁ</span><h2>Danh mục</h2></div></div><div className="category-list"><button className={!categoryId?"category-pill active":"category-pill"} onClick={()=>setCategoryId("")}>Tất cả</button>{categories.map(c=><button key={c.id} className={categoryId===c.id?"category-pill active":"category-pill"} onClick={()=>setCategoryId(c.name)}>{c.name}<small>{c.productCount??0}</small></button>)}</div></section>

    <section className="section" id="products"><div className="section-head"><div><span className="eyebrow">ĐƯỢC YÊU THÍCH</span><h2>Sản phẩm {categoryId ? "" : "nổi bật"}</h2></div></div>{loading?<p className="muted">Đang tải sản phẩm...</p>:<div className="grid">{products.map(p=><ProductCard key={p.id} p={p} onAdd={add}/>)}{!products.length&&<p className="muted">Không có sản phẩm phù hợp.</p>}</div>}</section>
    <section className="promo" id="deal"><div><span className="eyebrow">WEEKEND SALE</span><h2>Giảm đến 30%<br/>cho đơn đầu tiên</h2><p>Dùng mã <b>NOVA30</b> để nhận ưu đãi.</p></div><div className="promo-art">🛍️</div></section>
    <footer><div className="logo">✦ NOVASHOP</div><span>© 2026 NovaShop. Crafted for better living.</span><Link to="/login">Đăng nhập / Admin →</Link></footer>

    {openCart&&<div className="overlay" onClick={()=>setOpenCart(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h2>Giỏ hàng ({cartCount})</h2><button onClick={()=>setOpenCart(false)}><X/></button></div>{cart.length===0?<div className="empty">🛒<h3>Giỏ hàng đang trống</h3><p>Thêm sản phẩm bạn yêu thích nhé.</p></div>:<><div className="cart-items">{cart.map(p=><div className="cart-item" key={p.id}><span className="mini">{p.emoji||"📦"}</span><div className="cart-item-info"><b>{p.name}</b><p>{money(p.price)}</p><div className="qty"><button disabled={p.quantity<=1} onClick={()=>changeQty(p.id,-1)}><Minus size={13}/></button><strong>{p.quantity}</strong><button disabled={p.quantity>=p.stock} onClick={()=>changeQty(p.id,1)}><Plus size={13}/></button></div></div><div className="cart-item-right"><b>{money(p.price*p.quantity)}</b><button onClick={()=>remove(p.id)}><Trash2 size={16}/></button></div></div>)}</div><div className="cart-total"><span>Tổng cộng</span><b>{money(total)}</b></div>{checkout?<form onSubmit={placeOrder}><label>Họ tên<input required value={form.shippingName} onChange={e=>setForm({...form,shippingName:e.target.value})}/></label><label>Số điện thoại<input required value={form.shippingPhone} onChange={e=>setForm({...form,shippingPhone:e.target.value})}/></label><label>Địa chỉ<input required value={form.shippingAddress} onChange={e=>setForm({...form,shippingAddress:e.target.value})}/></label><label>Ghi chú<input value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label><button className="checkout" disabled={submitting}>{submitting?"Đang xử lý...":`Xác nhận · ${money(total)}`}</button></form>:<button className="checkout" onClick={()=>session.user?setCheckout(true):navToLogin()}>{session.user?`Thanh toán · ${money(total)}`:"Đăng nhập để thanh toán"}</button>}</>}</aside></div>}
  </div>;
}
