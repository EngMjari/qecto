import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../Pages/LoadingScreen/LoadingScreen";
import { fetchUserInfo, logout as logoutApi } from "../api/authApi";

export const AuthContext = createContext();
const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://192.168.1.101:8000";

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
      loadUserProfile();
    } else {
      setLoadingProfile(false);
    }

    function handleLogout() {
      logout();
    }
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const user = await fetchUserInfo();
      setUserProfile({
        id: user.id,
        image: user.profile_image?.startsWith("http")
          ? user.profile_image
          : `${BASE_URL}${
              user.profile_image || "/media/profile_images/default.png"
            }`,
        name: user.full_name,
      });

      if (user.is_superuser) setUserRole("superadmin");
      else if (user.is_staff) setUserRole("admin");
      else setUserRole("user");
    } catch (error) {
      console.error("خطا در دریافت اطلاعات کاربر:", error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoadingProfile(false);
    }
  };

  const login = async (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setIsAuthenticated(true);
    await loadUserProfile();
  };

  const logout = () => {
    logoutApi();
    setIsAuthenticated(false);
    setUserProfile(null);
    setUserRole(null);
    setLoadingProfile(false);
    navigate("/");
  };

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
        isAdmin: userRole === "admin" || userRole === "superadmin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
