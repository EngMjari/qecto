// src/Router.js
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./Context/AuthContext";

import Navbar from "./Components/Navbar";
import Login from "./Components/Login";
import Dashboard from "./Pages/Dashboard";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import SuperAdminPanel from "./Pages/SuperAdminPanel";
import AdminPanel from "./Pages/AdminPanel";
import ProtectedRoute from "./Components/ProtectedRoute";
import NotFound from "./Pages/NotFound";
import Forbidden from "./Pages/Forbidden";

function Router() {
  const { userRole, isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated && !userRole) {
    return <p className="text-center mt-5">در حال بارگذاری اطلاعات کاربر...</p>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]} userRole={userRole}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute allowedRoles={["admin"]} userRole={userRole}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin-panel"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]} userRole={userRole}>
              <SuperAdminPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default Router;
