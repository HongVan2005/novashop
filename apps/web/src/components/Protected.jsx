import { Navigate } from "react-router-dom";
import { session } from "../api";

export default function Protected({ role, children }) {
  const user = session.user;

  if (!user) {
    return <Navigate to={role === "ADMIN" ? "/admin/login" : "/login"} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  }
  return children;
}
