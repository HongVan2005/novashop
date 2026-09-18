import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập." });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
    }
    next();
  };
}
