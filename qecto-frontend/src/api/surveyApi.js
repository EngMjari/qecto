// api/surveyApi.js :
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchSurveyRequests = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.SURVEY.REQUESTS);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت درخواست‌های نقشه‌برداری:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const fetchSurveyRequest = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.SURVEY.REQUESTS}${id}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات درخواست نقشه‌برداری:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const createSurveyRequest = async (formValues) => {
  try {
    console.log("FormValues received for survey:", formValues); // برای دیباگ

    // اعتبارسنجی‌های ضروری
    if (!formValues.property_type) {
      throw new Error("نوع ملک اجباری است.");
    }
    if (!formValues.location?.lat || !formValues.location?.lng) {
      throw new Error("مختصات موقعیت (lat, lng) اجباری است.");
    }

    const formData = new FormData();
    if (formValues.project && formValues.project !== "new") {
      formData.append("project", formValues.project);
    }
    if (formValues.project_name) {
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
    formData.append("description", formValues.description || "");
    formData.append("location_lat", formValues.location.lat);
    formData.append("location_lng", formValues.location.lng);

    if (Array.isArray(formValues.attachments)) {
      formValues.attachments.forEach(({ file, title }) => {
        formData.append("attachments", file);
        formData.append("titles", title || "");
      });
    }

    console.log(
      "Sending FormData to API for survey:",
      Object.fromEntries(formData)
    ); // برای دیباگ

    const response = await axiosInstance.post(
      API_ENDPOINTS.SURVEY.REQUESTS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ثبت درخواست نقشه‌برداری:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};
