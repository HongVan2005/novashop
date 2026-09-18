import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StatCard from "../../components/StatCard";
import OrderRow from "../../components/OrderRow";
import { useToast } from "../../components/Toast";
import { adminApi, orderApi } from "../../api";
import { money } from "../../format";

export default function Dashboard() {
  const showToast = useToast();
  const { refreshPending } = useOutletContext();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);

  const load = () => {
    Promise.all([adminApi.dashboard(), orderApi.all()])
      .then(([d, o]) => { setData(d); setOrders(o); })
      .catch(e => showToast(e.message, "error"));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await orderApi.updateStatus(id, status);
      setOrders(x => x.map(o => o.id === id ? { ...o, status: updated.status } : o));
      refreshPending();
    } catch (e) { showToast(e.message, "error"); }
  };

  const stats = data?.stats || { revenue: 0, orders: 0, customers: 0, products: 0 };
  const maxRevenue = Math.max(1, ...(data?.monthly || [{ revenue: 1 }]).map(x => x.revenue));

  return (
    <>
      <div className="stats">
        <StatCard title="Doanh thu" value={money(stats.revenue)} change="Tất cả đơn hợp lệ" icon="↗" />
        <StatCard title="Đơn hàng" value={stats.orders} change="Tổng đơn" icon="◫" />
        <StatCard title="Khách hàng" value={stats.customers} change="Đang hoạt động" icon="♙" />
        <StatCard title="Sản phẩm" value={stats.products} change="Đang bán" icon="◇" />
      </div>

      <div className="admin-grid">
        <div className="panel">
          <div className="panel-head"><div><h2>Doanh thu</h2><p>7 tháng gần nhất</p></div></div>
          <div className="chart-area">
            <div className="bars">
              {(data?.monthly || []).map((m, i) => (
                <div className="bar-col" key={i}>
                  <div className="bar" style={{ height: `${Math.max(5, Math.min(100, (m.revenue / maxRevenue) * 100))}%` }}></div>
                  <span>{new Date(m.month).toLocaleDateString("vi-VN", { month: "2-digit" })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h2>Đơn hàng mới</h2><p>Gần nhất</p></div></div>
          <div className="orders">
            {orders.slice(0, 6).map(o => <OrderRow key={o.id} o={o} onStatus={updateStatus} />)}
            {orders.length === 0 && <p className="muted">Chưa có đơn hàng nào.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
