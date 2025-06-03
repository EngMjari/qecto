import React, { useContext, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "./Context/AuthContext";
import Navbar from "./Components/Navbar";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import SuperAdminPanel from "./Pages/SuperAdminPanel/SuperAdminPanel";
import AdminPanel from "./Pages/AdminPanel/AdminPanel";
import CreateRequest from "./Components/Request/CreateRequest";
import NotFound from "./Pages/NotFound";
import Forbidden from "./Pages/Forbidden";
import ProjectsList from "./Pages/Projects/ProjectsList";
import ProjectDetails from "./Pages/Projects/ProjectDetails";

function ProtectedRoute({ children, isAuthenticated, userRole, allowedRoles, onlyAuth }) {
  const { loadingProfile } = useContext(AuthContext);

  if (loadingProfile) {
    return <p className="text-center mt-10">در حال بارگذاری پروفایل...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (onlyAuth) {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function Router() {
  const { userRole, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin-panel") ||
    location.pathname.startsWith("/super-admin-panel") ||
    location.pathname.startsWith("/my-projects");

  const getPageTitle = () => {
    if (location.pathname.includes("dashboard")) return "داشبورد";
    if (location.pathname.includes("admin-panel")) return "پنل ادمین";
    if (location.pathname.includes("super-admin-panel")) return "پنل ابرادمین";
    if (location.pathname.includes("my-projects")) return "پروژه‌های من";
    return "";
  };

  return (
    <>
      <Navbar role={userRole} isDashboard={isDashboardRoute} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} currentTitle={getPageTitle()} />

      <Routes>
        {/* مسیرهای عمومی */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request" element={<CreateRequest />} />

        {/* مسیرهای پروژه */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["user", "admin", "superadmin"]}>
              <ProjectsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["user", "admin", "superadmin"]}>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />

        {/* مسیر داشبورد کاربر عادی */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* مسیر داشبورد ادمین */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* مسیر داشبورد سوپر ادمین */}
        <Route
          path="/super-admin-panel"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={["superadmin"]}>
              <SuperAdminPanel />
            </ProtectedRoute>
          }
        />

        {/* صفحات دسترسی غیرمجاز و 404 */}
        <Route path="/unauthorized" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default Router;
