// src/api/user.js
import axiosInstance from "../utils/axiosInstance";

export const fetchUserInfo = async () => {
  try {
    const response = await axiosInstance.get("/api/user-info/");
    return response.data;
  } catch (error) {
    throw error;
  }
};
