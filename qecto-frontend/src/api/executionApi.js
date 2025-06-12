// src/api/executionApi.js
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchExecutionRequests = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.EXECUTION.REQUESTS);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت درخواست‌های اجرا:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const fetchExecutionRequest = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.EXECUTION.REQUESTS}${id}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات درخواست اجرا:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const createExecutionRequest = async (formValues) => {
  try {
    if (!formValues.project && !formValues.project_name) {
      throw new Error(
        "لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید."
      );
    }

    const formData = new FormData();
    if (formValues.project && formValues.project !== "new") {
      formData.append("project", formValues.project);
    } else if (formValues.project_name) {
      formData.append("project_name", formValues.project_name);
    }
    if (formValues.description) {
      formData.append("description", formValues.description);
    }
    if (formValues.area) {
      formData.append("area", formValues.area);
    }
    if (formValues.building_area) {
      formData.append("building_area", formValues.building_area);
    }
    if (formValues.permit_number) {
      formData.append("permit_number", formValues.permit_number);
    }
    if (formValues.location?.lat && formValues.location?.lng) {
      formData.append("location_lat", formValues.location.lat);
      formData.append("location_lng", formValues.location.lng);
    }
    if (Array.isArray(formValues.attachments)) {
      formValues.attachments.forEach(({ file, title }) => {
        formData.append("attachments", file);
        formData.append("titles", title || "");
      });
    }

    const response = await axiosInstance.post(
      API_ENDPOINTS.EXECUTION.REQUESTS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ثبت درخواست اجرا:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};
