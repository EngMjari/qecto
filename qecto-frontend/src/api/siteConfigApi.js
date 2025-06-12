import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";
// گرفتن تنظیمات سایت (برای عموم کاربران)
export const fetchSiteConfig = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.SITECONFIG);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات سایت:", error);
    throw error;
  }
};

// بروزرسانی تنظیمات سایت (فقط برای سوپرادمین‌ها)
export const updateSiteConfig = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await axiosInstance.patch(
      API_ENDPOINTS.SITECONFIG,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در بروزرسانی تنظیمات سایت:", error);
    throw error;
  }
};
