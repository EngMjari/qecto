import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, userRole, isAuthenticated, onlyAuth, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // اگر فقط باید لاگین باشه، نقش چک نمی‌کنیم
  if (onlyAuth) return children;

  // اگر allowedRoles تعریف شده، نقش کاربر باید داخل allowedRoles باشه
  if (!allowedRoles.includes(userRole)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
