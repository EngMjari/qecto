import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = "http://192.168.1.101:8000";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user-profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data;
      setUserProfile({
        image: user.image ? `${BASE_URL}/${user.image}` : "/default-profile.jpg",
        name: user.full_name,
      });
    } catch (error) {}
  };

  const login = (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setIsAuthenticated(true);
    fetchUserProfile(access);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, userProfile }}>{children}</AuthContext.Provider>;
}
