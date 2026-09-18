import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../utils.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const { q, category, page = "1", limit = "20" } = req.query;
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    isActive: true,
    ...(category ? { category: String(category) } : {}),
    ...(q ? { name: { contains: String(q), mode: "insensitive" } } : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.product.count({ where })
  ]);

  res.json({ items, pagination: { page: Number(page), limit: take, total } });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product || !product.isActive) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
  res.json(product);
}));

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  category: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  oldPrice: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  emoji: z.string().optional(),
  tag: z.string().optional(),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional()
});

router.post("/", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data });
  res.status(201).json(product);
}));

router.patch("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const data = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json(product);
}));

router.delete("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
}));

export default router;
