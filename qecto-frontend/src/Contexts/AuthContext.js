// Contexts/AuthContext.js:
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; // دقت کن axiosInstance ایمپورت شده
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../Pages/LoadingScreen/LoadingScreen"; // اصلاح آدرس ایمپورت

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    } else {
      setLoadingProfile(false);
    }

    // گوش دادن به رویداد لاگ‌اوت که از axiosInstance می‌آید
    function handleLogout() {
      logout();
    }
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await axiosInstance.get("/api/user-info/");
      const user = response.data;
      setUserProfile({
        image: user.image
          ? user.image.startsWith("http")
            ? user.image
            : `${axiosInstance.defaults.baseURL}${user.image}`
          : `${axiosInstance.defaults.baseURL}/media/profile_images/default.png`,
        name: user.full_name,
      });

      if (user.is_superuser) setUserRole("superadmin");
      else if (user.is_staff) setUserRole("admin");
      else setUserRole("user");
    } catch (error) {
      console.log("خطا در دریافت اطلاعات کاربر:", error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const login = async (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setIsAuthenticated(true);
    await fetchUserProfile();
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    setUserProfile(null);
    setUserRole(null);
    setLoadingProfile(false);
    navigate("/");
  };

  // اگر در حال لودینگ هستیم لودینگ نمایش بده، وگرنه children رو رندر کن
  if (loadingProfile) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        userProfile,
        userRole,
        loadingProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
