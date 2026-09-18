export const money = n => new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + "đ";

export const slugify = s => s
  .toString()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)+/g, "");
