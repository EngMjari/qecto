// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.1.101:8000",
  withCredentials: false,
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

    // اگر خطای 401 و اولین بار رفرش کردن توکن است
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh }
          );
          const newAccessToken = response.data.access;
          localStorage.setItem("access", newAccessToken);

          // هدر درخواست اصلی را به توکن جدید آپدیت کن
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // دوباره درخواست اصلی را ارسال کن
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // اگر رفرش توکن هم خطا داشت، مثلا توکن‌ها منقضی شده‌اند
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          // اینجا می‌تونی event یا callback تعریف کنی که به Context اطلاع بده کاربر باید لاگ‌اوت شود
          window.dispatchEvent(new Event("logout"));

          return Promise.reject(refreshError);
        }
      } else {
        // اگر توکن رفرش نبود، لاگ‌اوت کن
        window.dispatchEvent(new Event("logout"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
