import axiosInstance from "../utils/axiosInstance";

// گرفتن لیست پروژه‌ها (صفحه‌بندی شده)
export const fetchProjects = (params) => {
  // params مثل { page: 1 } می‌تونه باشه برای صفحه‌بندی
  return axiosInstance.get("/api/projects/", { params });
};

// گرفتن جزئیات یک پروژه خاص
export const fetchProjectDetails = (id) => {
  return axiosInstance.get(`/api/projects/${id}/`);
};

// ارسال درخواست ساخت پروژه جدید
export const createProjectRequest = (data) => {
  return axiosInstance.post("/api/projects/create/", data);
};

// گرفتن آمار داشبورد پروژه‌ها
export const fetchDashboardStats = () => {
  return axiosInstance.get("/api/projects/dashboard/");
};

// گرفتن تمام داده‌های داشبورد (کاربر، پروژه‌ها، درخواست‌ها، تیکت‌ها و ...)
export const fetchAllData = () => {
  return axiosInstance.get("/api/data/");
};

export const fetchAllRequests = (params = {}) => {
  return axiosInstance.get("/api/projects/requests/", { params });
};
