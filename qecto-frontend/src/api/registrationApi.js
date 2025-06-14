// src/api/registrationApi.js
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchRegistrationRequests = async () => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.REGISTRATION.REQUESTS
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت درخواست‌های اخذ سند:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const fetchRegistrationRequest = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.REGISTRATION.REQUESTS}${id}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات درخواست اخذ سند:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const createRegistrationRequest = async (formValues) => {
  try {
    console.log("FormValues received:", formValues); // برای دیباگ

    // اعتبارسنجی‌های ضروری
    if (!formValues.property_type) {
      throw new Error("نوع ملک اجباری است.");
    }
    if (!formValues.ownership_status) {
      throw new Error("وضعیت مالکیت اجباری است.");
    }
    if (formValues.ownership_status === "shared_deed") {
      if (!formValues.main_parcel_number || !formValues.sub_parcel_number) {
        throw new Error("برای سند مشاعی، پلاک اصلی و فرعی اجباری هستند.");
      }
    }

    const formData = new FormData();
    if (formValues.project && formValues.project !== "new") {
      formData.append("project", formValues.project);
    }
    if (formValues.project_name) {
      formData.append("project_name", formValues.project_name);
    }
    formData.append("property_type", formValues.property_type);
    formData.append("ownership_status", formValues.ownership_status);
    if (formValues.area) {
      formData.append("area", formValues.area);
    }
    if (formValues.building_area) {
      formData.append("building_area", formValues.building_area);
    }
    if (formValues.main_parcel_number) {
      formData.append("main_parcel_number", formValues.main_parcel_number);
    }
    if (formValues.sub_parcel_number) {
      formData.append("sub_parcel_number", formValues.sub_parcel_number);
    }
    formData.append(
      "request_survey",
      formValues.request_survey ? "true" : "false"
    );
    if (formValues.location?.lat && formValues.location?.lng) {
      formData.append("location_lat", formValues.location.lat);
      formData.append("location_lng", formValues.location.lng);
    }
    formData.append("description", formValues.description || "");

    if (Array.isArray(formValues.attachments)) {
      formValues.attachments.forEach(({ file, title }) => {
        formData.append("attachments", file);
        formData.append("titles", title || "");
      });
    }

    console.log("Sending FormData to API:", Object.fromEntries(formData)); // برای دیباگ

    const response = await axiosInstance.post(
      API_ENDPOINTS.REGISTRATION.REQUESTS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ثبت درخواست اخذ سند:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};
