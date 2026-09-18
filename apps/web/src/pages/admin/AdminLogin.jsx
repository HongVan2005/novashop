import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { authApi, session } from "../../api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = await authApi.login(email, password, "ADMIN");
      session.save(data);
      nav("/admin", { replace: true });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page admin-auth">
      <Link to="/" className="logo auth-logo">✦ NOVASHOP</Link>
      <div className="auth-card admin-auth-card">
        <div className="auth-top">
          <div className="admin-shield"><ShieldCheck size={22} /></div>
          <span className="eyebrow">KHU VỰC QUẢN TRỊ</span>
          <h1>Đăng nhập Admin</h1>
          <p>Chỉ dành cho quản trị viên hệ thống NovaShop</p>
        </div>
        <form onSubmit={submit}>
          <label>Email quản trị<input type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@novashop.vn" required /></label>
          <label>Mật khẩu<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary full dark" disabled={loading}>
            {loading ? "Đang xác thực..." : <>Vào trang quản trị <ArrowRight size={18} /></>}
          </button>
        </form>
        <div className="demo">Demo: <b>admin@novashop.vn</b> / <b>123456</b></div>
        <p className="back"><Link to="/">← Về trang cửa hàng</Link></p>
      </div>
    </div>
  );
}
