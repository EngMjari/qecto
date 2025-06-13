import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchUserRequests = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REQUESTS.LIST, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت درخواست‌ها:", error);
    throw error;
  }
};

export const fetchRequestDetail = async (requestId) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.REQUESTS.DETAIL}${requestId}/detail/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات درخواست:", error);
    throw error;
  }
};
