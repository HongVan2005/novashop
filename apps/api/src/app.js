import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import customerRoutes from "./routes/customers.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",").map(x => x.trim()) || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút." }
}));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "novashop-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: `Không tìm thấy endpoint ${req.method} ${req.originalUrl}.` });
});

app.use((err, req, res, next) => {
  if (err?.name === "ZodError") {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ.",
      errors: err.issues
    });
  }
  if (err?.code === "P2002") return res.status(409).json({ message: "Dữ liệu đã tồn tại." });
  if (err?.code === "P2025") return res.status(404).json({ message: "Không tìm thấy dữ liệu." });
  if (err?.statusCode) return res.status(err.statusCode).json({ message: err.message });

  console.error(err);
  res.status(500).json({ message: "Có lỗi xảy ra ở server." });
});

export default app;
