import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { authApi, session } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState("CUSTOMER");
  const [email, setEmail] = useState("customer@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeRole = next => {
    setRole(next);
    setError("");
    if (next === "ADMIN") { setEmail("admin@novashop.vn"); setPassword("123456"); }
    else { setEmail("customer@gmail.com"); setPassword("123456"); }
  };

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = await authApi.login(email.trim(), password, role);
      session.save(data);
      nav(role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="logo auth-logo">✦ NOVASHOP</Link>
      <div className="auth-card">
        <div className="auth-top">
          {role === "ADMIN" && <div className="admin-shield"><ShieldCheck size={22}/></div>}
          <span className="eyebrow">{role === "ADMIN" ? "KHU VỰC QUẢN TRỊ" : "WELCOME BACK"}</span>
          <h1>{role === "ADMIN" ? "Đăng nhập Admin" : "Đăng nhập"}</h1>
          <p>{role === "ADMIN" ? "Đăng nhập quản trị trực tiếp tại đây" : "Chào mừng bạn trở lại NovaShop"}</p>
        </div>

        <div className="login-tabs">
          <button type="button" className={role === "CUSTOMER" ? "active" : ""} onClick={() => changeRole("CUSTOMER")}>Khách hàng</button>
          <button type="button" className={role === "ADMIN" ? "active" : ""} onClick={() => changeRole("ADMIN")}>Admin</button>
        </div>

        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Mật khẩu<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary full" disabled={loading}>
            {loading ? "Đang xác thực..." : <>{role === "ADMIN" ? "Vào trang quản trị" : "Đăng nhập"} <ArrowRight size={18}/></>}
          </button>
        </form>
        <div className="demo">Demo: <b>{role === "ADMIN" ? "admin@novashop.vn" : "customer@gmail.com"}</b> / <b>123456</b></div>
        <p className="back"><Link to="/">← Về trang cửa hàng</Link></p>
      </div>
    </div>
  );
}
