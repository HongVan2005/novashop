import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, publicUser } from "../utils.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } }
  });
  res.json(customers.map(x => ({ ...publicUser(x), orderCount: x._count.orders })));
}));

router.get("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const customer = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } } }
  });
  if (!customer || customer.role !== "CUSTOMER") return res.status(404).json({ message: "Không tìm thấy khách hàng." });
  res.json(publicUser(customer));
}));

router.post("/", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const body = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6).default("123456")
  }).parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return res.status(409).json({ message: "Email đã tồn tại." });

  const passwordHash = await bcrypt.hash(body.password, 12);
  const customer = await prisma.user.create({
    data: { name: body.name, email: body.email, passwordHash, role: "CUSTOMER" }
  });

  res.status(201).json(publicUser(customer));
}));

router.patch("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const body = z.object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional()
  }).parse(req.body);

  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.role !== "CUSTOMER") return res.status(404).json({ message: "Không tìm thấy khách hàng." });

  const customer = await prisma.user.update({ where: { id: req.params.id }, data: body });
  res.json(publicUser(customer));
}));

router.delete("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.role !== "CUSTOMER") return res.status(404).json({ message: "Không tìm thấy khách hàng." });

  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ deleted: true });
}));

export default router;
