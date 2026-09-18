import React from "react";
import { session } from "../../api";

export default function Settings() {
  const user = session.user;
  return (
    <div className="panel">
      <h2>Cài đặt tài khoản</h2>
      <p className="muted">Đăng nhập với <b>{user?.name}</b> ({user?.email}).</p>
      <p className="muted">
        Backend đang dùng JWT, RBAC (phân quyền theo vai trò) và PostgreSQL qua Prisma.
        Hãy đổi <code>JWT_SECRET</code> và mật khẩu demo trước khi đưa vào production.
      </p>
    </div>
  );
}
