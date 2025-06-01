import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    axios.get(`${BASE_URL}/api/user-info/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setUser(res.data);
      setLoading(false);
    })
    .catch((err) => {
      setUser(null);
      setError(err);
      setLoading(false);
    });
  }, []);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, loading, error };
}
