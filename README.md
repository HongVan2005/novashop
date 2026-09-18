# NovaShop Full Stack

NovaShop là dự án thương mại điện tử full-stack:

- **Frontend**: React + Vite + React Router + Lucide (tách theo trang/component chuẩn)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt, phân quyền CUSTOMER / ADMIN
- **Trang quản trị (admin) có trang đăng nhập RIÊNG** tại `/admin/login`, tách biệt hoàn toàn với đăng nhập khách hàng ở `/login`
- Trang admin có đầy đủ **Thêm / Sửa / Xóa** cho Sản phẩm, Danh mục, Khách hàng — gọi thẳng API backend thật (có xác thực + phân quyền), không phải dữ liệu giả
- Quản lý đơn hàng, thống kê dashboard, báo cáo doanh thu theo tháng
- Validate dữ liệu bằng Zod, bảo mật với Helmet + rate limit, xử lý lỗi tập trung
- Prisma seed sẵn dữ liệu mẫu: tài khoản admin/khách hàng, sản phẩm, danh mục

## Cấu trúc dự án

```text
shop-fe/
├─ apps/
│  ├─ web/                        # Frontend React/Vite
│  │  └─ src/
│  │     ├─ components/           # Modal, ConfirmDialog, Toast, Sidebar, ProductCard...
│  │     ├─ pages/
│  │     │  ├─ Store.jsx          # Trang cửa hàng cho khách
│  │     │  ├─ Login.jsx          # Đăng nhập khách hàng
│  │     │  └─ admin/
│  │     │     ├─ AdminLogin.jsx  # Đăng nhập admin RIÊNG
│  │     │     ├─ AdminLayout.jsx # Khung sidebar + nội dung
│  │     │     ├─ Dashboard.jsx
│  │     │     ├─ Orders.jsx
│  │     │     ├─ Products.jsx    # Thêm/Sửa/Xóa sản phẩm
│  │     │     ├─ Categories.jsx  # Thêm/Sửa/Xóa danh mục
│  │     │     ├─ Customers.jsx   # Thêm/Sửa/Khóa khách hàng
│  │     │     ├─ Reports.jsx
│  │     │     └─ Settings.jsx
│  │     ├─ api.js                # Toàn bộ hàm gọi API
│  │     ├─ format.js             # Định dạng tiền tệ, tạo slug
│  │     └─ App.jsx                # Định tuyến (React Router)
│  └─ api/                        # Backend Express/Prisma
│     ├─ prisma/                  # schema.prisma, seed.js
│     └─ src/
│        ├─ routes/               # auth, products, categories, orders, customers, admin
│        ├─ middleware/auth.js    # xác thực JWT + kiểm tra vai trò
│        └─ app.js / server.js
├─ docker-compose.yml
└─ README.md
```

## 1. Chạy PostgreSQL

```bash
docker compose up -d postgres
```

## 2. Backend

```bash
cd apps/api
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

API chạy tại: `http://localhost:4000`

## 3. Frontend

```bash
cd apps/web
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173` (Vite proxy `/api` sang backend).

## Tài khoản demo

**Khách hàng** — đăng nhập tại `/login`:
- Email: `customer@gmail.com`
- Mật khẩu: `123456`

**Quản trị viên** — đăng nhập tại `/admin/login` (trang riêng, không chung với khách hàng):
- Email: `admin@novashop.vn`
- Mật khẩu: `123456`

**Lưu ý:** đổi mật khẩu demo trước khi triển khai thực tế.

## Luồng xác thực

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@novashop.vn",
  "password": "123456",
  "role": "ADMIN"
}
```

Server kiểm tra tài khoản + vai trò khớp nhau rồi mới cấp JWT. Frontend chỉ điều hướng theo phản hồi từ server — **giao diện không tự quyết định ai là admin**, backend luôn là nơi xác thực cuối cùng.

## API chính

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Sản phẩm
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PATCH /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin — ẩn sản phẩm)

### Danh mục
- `GET /api/categories`
- `POST /api/categories` (admin)
- `PATCH /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin — chặn nếu còn sản phẩm thuộc danh mục)

### Đơn hàng
- `POST /api/orders` (khách hàng)
- `GET /api/orders/my` (đã đăng nhập)
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)

### Khách hàng (admin)
- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers` — tạo tài khoản khách hàng mới
- `PATCH /api/customers/:id` — sửa tên/email/trạng thái
- `DELETE /api/customers/:id` — khóa tài khoản (soft delete)

### Dashboard
- `GET /api/admin/dashboard`

## Ghi chú triển khai thực tế (production)

Dùng HTTPS, `JWT_SECRET` mạnh, PostgreSQL managed, access token ngắn hạn + refresh-token rotation, cookie HttpOnly/Secure/SameSite thay vì localStorage khi phù hợp, object storage cho ảnh sản phẩm, webhook cổng thanh toán, audit log, và quản lý secrets đúng chuẩn.
