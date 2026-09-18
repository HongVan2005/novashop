import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, ShoppingBag, Tag, BarChart3, Settings, LogOut
} from "lucide-react";
import { session } from "../api";

const ITEMS = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Đơn hàng", icon: Package },
  { to: "/admin/products", label: "Sản phẩm", icon: ShoppingBag },
  { to: "/admin/categories", label: "Danh mục", icon: Tag },
  { to: "/admin/customers", label: "Khách hàng", icon: Users },
  { to: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { to: "/admin/settings", label: "Cài đặt", icon: Settings }
];

export default function AdminSidebar({ pendingCount = 0 }) {
  const nav = useNavigate();
  const user = session.user;

  const logout = () => {
    session.clear();
    nav("/admin/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="logo">✦ NOVA<span>SHOP</span></div>
      <small>QUẢN TRỊ HỆ THỐNG</small>
      <div className="side-menu">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink to={to} key={to} end={end} className={({ isActive }) => isActive ? "selected" : ""}>
            <Icon size={19} />
            {label}
            {label === "Đơn hàng" && pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </NavLink>
        ))}
      </div>
      <div className="admin-user">
        <div className="avatar">{(user?.name || "AD").slice(0, 2).toUpperCase()}</div>
        <div><b>{user?.name}</b><small>{user?.email}</small></div>
        <button onClick={logout} title="Đăng xuất"><LogOut size={17} /></button>
      </div>
    </aside>
  );
}
