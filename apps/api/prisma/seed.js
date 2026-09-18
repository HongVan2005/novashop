import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["Audio", "audio", "Tai nghe vÃ  loa"],
  ["Wearable", "wearable", "Thiáº¿t bá»‹ Ä‘eo thÃ´ng minh"],
  ["Fashion", "fashion", "GiÃ y dÃ©p, phá»¥ kiá»‡n thá»i trang"],
  ["Camera", "camera", "MÃ¡y áº£nh vÃ  phá»¥ kiá»‡n"],
  ["Lifestyle", "lifestyle", "Äá»“ dÃ¹ng phong cÃ¡ch sá»‘ng"]
];

const products = [
  ["Aurora Headphone", "aurora-headphone", "Audio", 1890000, 2290000, "ðŸŽ§", "BÃ¡n cháº¡y", 50],
  ["Nova Smart Watch", "nova-smart-watch", "Wearable", 2490000, 2990000, "âŒš", "Má»›i", 35],
  ["Cloud Sneaker", "cloud-sneaker", "Fashion", 1590000, 1990000, "ðŸ‘Ÿ", "-20%", 80],
  ["Pixel Camera", "pixel-camera", "Camera", 6890000, 7490000, "ðŸ“·", "Hot", 18],
  ["Orbit Backpack", "orbit-backpack", "Lifestyle", 990000, 1290000, "ðŸŽ’", "-23%", 60],
  ["Halo Speaker", "halo-speaker", "Audio", 1290000, 1590000, "ðŸ”Š", "BÃ¡n cháº¡y", 42]
];

async function main() {
  const adminHash = await bcrypt.hash("123456", 12);
  const customerHash = await bcrypt.hash("123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@novashop.vn" },
    update: { name: "Vân Admin", role: Role.ADMIN, passwordHash: adminHash, isActive: true },
    create: { name: "Vân Admin", email: "admin@novashop.vn", role: Role.ADMIN, passwordHash: adminHash }
  });

  await prisma.user.upsert({
    where: { email: "customer@gmail.com" },
    update: { name: "Nova Customer", role: Role.CUSTOMER, passwordHash: customerHash, isActive: true },
    create: { name: "Nova Customer", email: "customer@gmail.com", role: Role.CUSTOMER, passwordHash: customerHash }
  });

  for (const [name, slug, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, isActive: true },
      create: { name, slug, description, isActive: true }
    });
  }

  for (const [name, slug, category, price, oldPrice, emoji, tag, stock] of products) {
    await prisma.product.upsert({
      where: { slug },
      update: { name, category, price, oldPrice, emoji, tag, stock, isActive: true },
      create: { name, slug, category, price, oldPrice, emoji, tag, stock, isActive: true }
    });
  }

  console.log("Seed completed.");
}

main().finally(() => prisma.$disconnect());



