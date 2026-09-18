export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function orderCode() {
  return `NS-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;
}
