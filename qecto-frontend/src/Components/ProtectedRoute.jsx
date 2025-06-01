// src/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, userRole, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default ProtectedRoute;
