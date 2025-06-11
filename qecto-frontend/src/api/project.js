// src/api/projectsApi.js
import axiosInstance from "../utils/axiosInstance";

// گرفتن لیست پروژه‌ها
export const fetchProjects = () => {
  return axiosInstance.get("/api/projects/");
};

// گرفتن جزئیات یک پروژه با شناسه (UUID)
export const fetchProjectDetail = (projectId) => {
  return axiosInstance.get(`/api/projects/${projectId}/`);
};
