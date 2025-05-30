import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = "http://localhost:8000";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user-info/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data;
      setUserProfile({
        image: user.image
          ? user.image.startsWith("http")
            ? user.image
            : `${BASE_URL}${user.image}`
          : `${BASE_URL}/media/profile_images/default.png`,
        name: user.full_name,
      });

      if (user.is_superuser) setUserRole("superadmin");
      else if (user.is_staff) setUserRole("admin");
      else setUserRole("user");
    } catch (error) {
      if (error.response?.status === 401) {
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          try {
            const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
              refresh,
            });
            const newAccess = res.data.access;
            localStorage.setItem("access", newAccess);
            fetchUserProfile(newAccess); // Retry with new access
          } catch (refreshError) {
            console.log("توکن رفرش هم نامعتبره، نیاز به ورود مجدد:", refreshError);
            logout(); // لاگ‌اوت کن چون refresh هم مشکل داره
          }
        }
      } else {
        console.log("خطا در دریافت اطلاعات کاربر:", error);
      }
    }
  };

  const login = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setIsAuthenticated(true);
    fetchUserProfile(access);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, userProfile, userRole }}>{children}</AuthContext.Provider>;
}
