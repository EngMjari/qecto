import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import { AuthProvider } from "./Context/AuthContext";
import Login from "./Components/Login";
import Dashboard from "./Pages/Dashboard";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import SuperAdminPanel from "./Pages/SuperAdminPanel";
import AdminPanel from "./Pages/AdminPanel";
import ProtectedRoute from "./Components/ProtectedRoute";
import NotFound from "./Pages/NotFound"; // برای هندل کردن صفحات ناموجود
import Forbidden from "./Pages/Forbidden";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      axios
        .get("http://192.168.1.101:8000/api/user-info/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data.is_superuser) {
            setUserRole("superadmin");
          } else if (res.data.is_staff) {
            setUserRole("admin");
          } else {
            setUserRole("user");
          }
        })
        .catch(() => setUserRole(null))
        .finally(() => setLoading(false));
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="text-center mt-5">در حال بارگذاری...</p>;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* صفحات عمومی */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* فقط کاربران عادی */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]} userRole={userRole}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* فقط ادمین */}
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute allowedRoles={["admin"]} userRole={userRole}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* فقط سوپر ادمین */}
          <Route
            path="/super-admin-panel"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]} userRole={userRole}>
                <SuperAdminPanel />
              </ProtectedRoute>
            }
          />

          {/* هندل صفحات ناموجود */}
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
