import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, orderCode } from "../utils.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

const createSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).max(99)
  })).min(1),
  shippingName: z.string().min(2).max(100),
  shippingPhone: z.string().min(8).max(20),
  shippingAddress: z.string().min(5).max(300),
  note: z.string().max(500).optional()
});

router.post("/", authenticate, requireRole("CUSTOMER"), asyncHandler(async (req, res) => {
  const body = createSchema.parse(req.body);
  const merged = new Map();
  for (const item of body.items) merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
  const normalizedItems = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
  const ids = normalizedItems.map(x => x.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true }
  });

  if (products.length !== ids.length) {
    return res.status(400).json({ message: "Một hoặc nhiều sản phẩm không còn tồn tại." });
  }

  const productMap = new Map(products.map(p => [p.id, p]));
  let total = 0;
  const orderItems = [];

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ tồn kho.` });
    }
    const subtotal = product.price * item.quantity;
    total += subtotal;
    orderItems.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal
    });
  }

  const order = await prisma.$transaction(async tx => {
    const created = await tx.order.create({
      data: {
        code: orderCode(),
        userId: req.user.id,
        total,
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        note: body.note,
        items: { create: orderItems }
      },
      include: { items: true }
    });

    for (const item of normalizedItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      });
      if (updated.count !== 1) throw Object.assign(new Error("Tồn kho vừa thay đổi. Vui lòng thử lại."), { statusCode: 409 });
    }

    return created;
  });

  res.status(201).json(order);
}));

router.get("/my", authenticate, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
}));

router.get("/", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const orders = await prisma.order.findMany({
    where: status ? { status: String(status) } : undefined,
    include: { user: { select: { id: true, name: true, email: true } }, items: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
}));

router.patch("/:id/status", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const body = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"])
  }).parse(req.body);

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: body.status },
    include: { items: true }
  });
  res.json(order);
}));

export default router;
