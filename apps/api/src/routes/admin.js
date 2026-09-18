import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../utils.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", authenticate, requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const [revenue, orders, customers, products, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } }
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, items: true }
    })
  ]);

  const monthly = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
           COALESCE(SUM(total), 0)::bigint AS revenue
    FROM "Order"
    WHERE status <> 'CANCELLED'
      AND "createdAt" >= NOW() - INTERVAL '7 months'
    GROUP BY 1
    ORDER BY 1
  `;

  res.json({
    stats: {
      revenue: revenue._sum.total || 0,
      orders,
      customers,
      products
    },
    monthly: monthly.map(x => ({ month: x.month, revenue: Number(x.revenue) })),
    recentOrders
  });
}));

export default router;
