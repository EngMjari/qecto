// src/api/expertApi.js
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchExpertRequests = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.EXPERT.REQUESTS);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت درخواست‌های کارشناسی:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const fetchExpertRequest = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.EXPERT.REQUESTS}${id}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات درخواست کارشناسی:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const createExpertRequest = async (formValues) => {
  try {
    if (!formValues.project && !formValues.project_name) {
      throw new Error(
        "لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید."
      );
    }
    if (!formValues.property_type) {
      throw new Error("نوع ملک اجباری است.");
    }
    const hasLocation = formValues.location?.lat && formValues.location?.lng;
    const hasParcel =
      formValues.main_parcel_number && formValues.sub_parcel_number;
    if (!hasLocation && !hasParcel) {
      throw new Error("باید حداقل یکی از مختصات یا پلاک‌های ثبتی وارد شود.");
    }

    const formData = new FormData();
    if (formValues.project && formValues.project !== "new") {
      formData.append("project", formValues.project);
    } else if (formValues.project_name) {
      formData.append("project_name", formValues.project_name);
    }
    formData.append("property_type", formValues.property_type);
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
    if (hasLocation) {
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

    const response = await axiosInstance.post(
      API_ENDPOINTS.EXPERT.REQUESTS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ثبت درخواست کارشناسی:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};
