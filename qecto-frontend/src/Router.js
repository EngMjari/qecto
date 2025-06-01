// src/Router.js
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./Context/AuthContext";

import Navbar from "./Components/Navbar";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import SuperAdminPanel from "./Pages/SuperAdminPanel/SuperAdminPanel";
import AdminPanel from "./Pages/AdminPanel/AdminPanel";
import ProtectedRoute from "./Components/ProtectedRoute";
import NotFound from "./Pages/NotFound";
import Forbidden from "./Pages/Forbidden";
import CreateRequest from "./Components/Request/CreateRequest";

function Router() {
  const { userRole, isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated && !userRole) {
    return <p className="text-center mt-5">در حال بارگذاری اطلاعات کاربر...</p>;
  }

  // کامپوننت‌های واسط برای راحتی استفاده
  const UserRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["user"]} userRole={userRole} isAuthenticated={isAuthenticated}>
      {children}
    </ProtectedRoute>
  );

  const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["admin"]} userRole={userRole} isAuthenticated={isAuthenticated}>
      {children}
    </ProtectedRoute>
  );

  const SuperAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["superadmin"]} userRole={userRole} isAuthenticated={isAuthenticated}>
      {children}
    </ProtectedRoute>
  );

  // آرایه روت‌ها
  const routes = [
    { path: "/", element: <Home />, protected: false },
    { path: "/login", element: <Login />, protected: false },
    { path: "/about", element: <About />, protected: false },
    { path: "/contact", element: <Contact />, protected: false },
    { path: "/request", element: <CreateRequest />, protected: false },

    { path: "/dashboard", element: <Dashboard />, protected: true, roles: ["user"] },
    { path: "/admin-panel", element: <AdminPanel />, protected: true, roles: ["admin"] },
    { path: "/super-admin-panel", element: <SuperAdminPanel />, protected: true, roles: ["superadmin"] },
  ];

  return (
    <>
      <Navbar />
      <Routes>
        {routes.map(({ path, element, protected: isProtected, roles }) => {
          if (!isProtected) {
            return <Route key={path} path={path} element={element} />;
          }

          // نقش‌ها و کامپوننت واسط
          if (roles.includes("user")) {
            return <Route key={path} path={path} element={<UserRoute>{element}</UserRoute>} />;
          }
          if (roles.includes("admin")) {
            return <Route key={path} path={path} element={<AdminRoute>{element}</AdminRoute>} />;
          }
          if (roles.includes("superadmin")) {
            return <Route key={path} path={path} element={<SuperAdminRoute>{element}</SuperAdminRoute>} />;
          }

          return null; // اگر نقش نامشخص بود
        })}

        <Route path="/unauthorized" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default Router;
