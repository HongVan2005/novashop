import React from "react";
import { Routes, Route } from "react-router-dom";
import Protected from "./components/Protected";
import Store from "./pages/Store";
import Login from "./pages/Login";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Customers from "./pages/admin/Customers";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Store />} />
      <Route path="/customer" element={<Protected role="CUSTOMER"><Store /></Protected>} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Protected role="ADMIN"><AdminLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
