const TOKEN_KEY = "novashop_token";
const USER_KEY = "novashop_user";

export const session = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  get user() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  },
  save(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (session.token) headers.Authorization = `Bearer ${session.token}`;

  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new Error("Không thể kết nối tới máy chủ. Hãy kiểm tra backend (apps/api) đã chạy ở cổng 4000 chưa.");
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!response.ok) {
    if (response.status === 401) session.clear();
    const message = data?.errors?.[0]?.message || data?.message || `Yêu cầu thất bại (mã lỗi ${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export const authApi = {
  login: (email, password, role) => api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role })
  }),
  register: (name, email, password) => api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  }),
  me: () => api("/auth/me")
};

export const productApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "") qs.set(k, v); });
    return api(`/products${qs.toString() ? `?${qs}` : ""}`);
  },
  get: (id) => api(`/products/${id}`),
  create: (payload) => api("/products", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id) => api(`/products/${id}`, { method: "DELETE" })
};

export const categoryApi = {
  list: () => api("/categories"),
  create: (payload) => api("/categories", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id) => api(`/categories/${id}`, { method: "DELETE" })
};

export const orderApi = {
  create: (payload) => api("/orders", { method: "POST", body: JSON.stringify(payload) }),
  mine: () => api("/orders/my"),
  all: () => api("/orders"),
  updateStatus: (id, status) => api(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  })
};

export const customerApi = {
  list: () => api("/customers"),
  get: (id) => api(`/customers/${id}`),
  create: (payload) => api("/customers", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id) => api(`/customers/${id}`, { method: "DELETE" })
};

export const adminApi = {
  dashboard: () => api("/admin/dashboard")
};
