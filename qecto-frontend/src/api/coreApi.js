import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchAdmins = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMINS.LIST);
    return response.data.results || response.data;
  } catch (error) {
    console.error("خطا در دریافت لیست ادمین‌ها:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};
