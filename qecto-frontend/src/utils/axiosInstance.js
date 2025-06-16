// src/utils/axiosInstance.js
import axios from "axios";

const BASE_URL = "http://192.168.1.101:8000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // غیرفعال کردن کوکی‌ها برای JWT
});

// درخواست‌ها هدر Authorization را اضافه می‌کنند
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// پاسخ‌ها را چک می‌کند و اگر 401 بود، تلاش می‌کند توکن را رفرش کند
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
            refresh,
          });
          const newAccessToken = response.data.access;
          localStorage.setItem("access", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.dispatchEvent(new Event("logout"));
          return Promise.reject(refreshError);
        }
      } else {
        window.dispatchEvent(new Event("logout"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
