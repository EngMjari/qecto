import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";

export const fetchReferrals = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REFERRALS.LIST, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت لیست ارجاع‌ها:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const fetchReferral = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.REFERRALS.DETAIL(id)
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات ارجاع:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const createReferral = async (formValues) => {
  try {
    if (
      !formValues.content_type ||
      !formValues.object_id ||
      !formValues.assigned_admin
    ) {
      throw new Error(
        "لطفاً نوع درخواست، شناسه درخواست و ادمین مقصد را مشخص کنید."
      );
    }

    const data = {
      content_type: formValues.content_type,
      object_id: formValues.object_id,
      assigned_admin: formValues.assigned_admin,
      description: formValues.description || "",
    };

    const response = await axiosInstance.post(
      API_ENDPOINTS.REFERRALS.CREATE,
      data
    );
    return response.data;
  } catch (error) {
    console.error("خطا در ثبت ارجاع:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const referProject = async (projectId, formValues) => {
  try {
    if (!formValues.assigned_admin) {
      throw new Error("لطفاً ادمین مقصد را مشخص کنید.");
    }

    const data = {
      assigned_admin: formValues.assigned_admin,
      description: formValues.description || "ارجاع پروژه به ادمین",
    };

    const response = await axiosInstance.post(
      API_ENDPOINTS.REFERRALS.PROJECT_REFER(projectId),
      data
    );
    return response.data;
  } catch (error) {
    console.error("خطا در ارجاع پروژه:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};

export const deleteReferral = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.REFERRALS.DETAIL(id)
    );
    return response.data;
  } catch (error) {
    console.error("خطا در حذف ارجاع:", error);
    if (error.response) {
      console.error("جزئیات خطا:", error.response.data);
    }
    throw error;
  }
};
