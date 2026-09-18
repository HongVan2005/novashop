import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../utils.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  const counts = await prisma.product.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: { _all: true }
  });
  const countMap = new Map(counts.map(c => [c.category, c._count._all]));

  res.json(categories.map(c => ({ ...c, productCount: countMap.get(c.name) || 0 })));
}));

router.get("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục." });
  res.json(category);
}));

const schema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional()
});

router.post("/", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const data = schema.parse(req.body);
  const category = await prisma.category.create({ data });
  res.status(201).json(category);
}));

router.patch("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const data = schema.partial().parse(req.body);
  const before = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ message: "Không tìm thấy danh mục." });

  const category = await prisma.category.update({ where: { id: req.params.id }, data });

  if (data.name && data.name !== before.name) {
    await prisma.product.updateMany({
      where: { category: before.name },
      data: { category: data.name }
    });
  }

  res.json(category);
}));

router.delete("/:id", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục." });

  const count = await prisma.product.count({ where: { category: category.name, isActive: true } });
  if (count > 0) {
    return res.status(409).json({ message: `Danh mục còn ${count} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.` });
  }
  await prisma.category.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });
  res.json({ deleted: true });
}));

export default router;
