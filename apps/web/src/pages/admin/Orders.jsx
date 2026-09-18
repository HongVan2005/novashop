import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import OrderRow from "../../components/OrderRow";
import { useToast } from "../../components/Toast";
import { orderApi } from "../../api";

export default function Orders() {
  const showToast = useToast();
  const { refreshPending } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    orderApi.all()
      .then(setOrders)
      .catch(e => showToast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await orderApi.updateStatus(id, status);
      setOrders(x => x.map(o => o.id === id ? { ...o, status: updated.status } : o));
      refreshPending();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="panel">
      <div className="panel-head"><div><h2>Tất cả đơn hàng</h2><p>Quản lý trạng thái đơn</p></div></div>
      <div className="orders">
        {loading && <p className="muted">Đang tải...</p>}
        {!loading && orders.length === 0 && <p className="muted">Chưa có đơn hàng nào.</p>}
        {orders.map(o => <OrderRow key={o.id} o={o} onStatus={updateStatus} />)}
      </div>
    </div>
  );
}
