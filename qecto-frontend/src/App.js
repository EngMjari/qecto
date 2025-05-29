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
import "./App.css";
import AdminPanel from "./Pages/AdminPanel";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("TOKEN:", token); // ← ببین اصلاً توکن هست یا نه

    if (token) {
      axios
        .get("http://192.168.1.101:8000/api/user-info/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log("USER INFO:", res.data); // ← ببین چی برمی‌گردونه
          const isSuperAdmin = res.data.is_superuser;
          setUserRole(isSuperAdmin ? "superadmin" : "admin");
        })
        .catch((err) => {
          console.error("خطا در دریافت اطلاعات کاربر:", err);
          setUserRole(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log("توکن پیدا نشد!");
      setUserRole(null);
      setLoading(false);
    }
  }, []);

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {userRole === "superadmin" && <Route path="/super-admin-panel" element={<SuperAdminPanel />} />}
          {userRole === "admin" && <Route path="/admin-panel" element={<AdminPanel />} />}
          {userRole !== "admin" && userRole !== "superadmin" && <Route path="/dashboard" element={<Dashboard />} />}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]} userRole={userRole}>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
