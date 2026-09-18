import React, { useEffect, useState } from "react";
import { adminApi } from "../../api";
import { useToast } from "../../components/Toast";
import { money } from "../../format";

export default function Reports() {
  const showToast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then(setData).catch(e => showToast(e.message, "error"));
  }, []);

  const stats = data?.stats || { revenue: 0, orders: 0, customers: 0, products: 0 };

  return (
    <div className="panel">
      <h2>Báo cáo tổng hợp</h2>
      <p className="muted">
        Doanh thu: <b>{money(stats.revenue)}</b> · Đơn: <b>{stats.orders}</b> · Khách: <b>{stats.customers}</b> · Sản phẩm: <b>{stats.products}</b>
      </p>
      <div className="chart-area">
        <div className="bars">
          {(data?.monthly || []).map((m, i) => {
            const max = Math.max(1, ...(data?.monthly || [{ revenue: 1 }]).map(x => x.revenue));
            return (
              <div className="bar-col" key={i}>
                <div className="bar" style={{ height: `${Math.max(5, Math.min(100, (m.revenue / max) * 100))}%` }}></div>
                <span>{new Date(m.month).toLocaleDateString("vi-VN", { month: "2-digit", year: "2-digit" })}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
