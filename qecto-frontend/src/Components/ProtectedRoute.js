// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles, userRole }) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;  // یا نمایش خطا یا صفحه Not Authorized
  }
  return children;
}
