// src/api/authApi.js
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

// ارسال کد OTP به شماره موبایل
export const sendOtp = async (phone) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.OTP, { phone });
  return response.data;
};

// تایید کد OTP
export const verifyOtp = async (phone, code) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY, {
    phone,
    code,
  });
  return response.data;
};

// گرفتن توکن JWT
export const login = async (phone, password) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
    phone,
    password,
  });
  return response.data;
};

// رفرش توکن
export const refreshToken = async (refresh) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, {
    refresh,
  });
  return response.data;
};

// دریافت اطلاعات کاربر
export const fetchUserInfo = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.AUTH.USER_INFO);
  return response.data;
};

// خروج (صرفاً پاک‌کردن توکن‌ها در کلاینت)
export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
