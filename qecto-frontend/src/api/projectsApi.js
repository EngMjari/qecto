// src/api/projectsApi.js
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";
// گرفتن لیست پروژه‌ها به همراه درخواست‌های مرتبط (براساس سطح دسترسی کاربر)
export const fetchProjects = async () => {
  try {
    const response = await axiosInstance.get("/api/projects/");
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت پروژه‌ها:", error);
    throw error;
  }
};

// گرفتن جزئیات یک پروژه خاص همراه با درخواست‌های مرتبط آن
export const fetchProjectById = async (projectId) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PROJECTS.DETAIL,
      projectId
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
