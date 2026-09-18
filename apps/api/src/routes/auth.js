import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, publicUser } from "../utils.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "ADMIN"]).default("CUSTOMER")
});

router.post("/register", asyncHandler(async (req, res) => {
  const body = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6)
  }).parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return res.status(409).json({ message: "Email đã tồn tại." });

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, passwordHash }
  });

  res.status(201).json({ user: publicUser(user) });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
  }

  if (user.role !== body.role) {
    return res.status(403).json({ message: "Tài khoản không thuộc vai trò đã chọn." });
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.json({ token, user: publicUser(user) });
}));

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
