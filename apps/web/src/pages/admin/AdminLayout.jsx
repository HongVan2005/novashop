import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { orderApi } from "../../api";

const TITLES = {
  "/admin": "Tổng quan",
  "/admin/orders": "Đơn hàng",
  "/admin/products": "Sản phẩm",
  "/admin/categories": "Danh mục",
  "/admin/customers": "Khách hàng",
  "/admin/reports": "Báo cáo",
  "/admin/settings": "Cài đặt"
};

export default function AdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(() => {
    orderApi.all()
      .then(orders => setPendingCount(orders.filter(o => o.status === "PENDING").length))
      .catch(() => {});
  }, []);

  useEffect(() => { refreshPending(); }, [refreshPending, location.pathname]);

  const title = TITLES[location.pathname] || "Quản trị";

  return (
    <div className="admin">
      <AdminSidebar pendingCount={pendingCount} />
      <main className="admin-main">
        <div className="admin-top">
          <div><span className="muted">NovaShop Admin</span><h1>{title}</h1></div>
          <div className="admin-actions">
            <button className="primary small" onClick={() => nav("/")}>Xem cửa hàng <ArrowRight size={16} /></button>
          </div>
        </div>
        <Outlet context={{ refreshPending }} />
      </main>
    </div>
  );
}
