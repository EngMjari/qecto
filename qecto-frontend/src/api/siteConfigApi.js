// src/services/siteConfigService.js
import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "../api/apiEndpoints";

// گرفتن تنظیمات سایت (SiteConfig)
export const fetchSiteConfig = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.SITECONFIG.CONFIG);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات سایت:", error);
    throw error;
  }
};

// به‌روزرسانی تنظیمات سایت (SiteConfig)
export const updateSiteConfig = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await axiosInstance.patch(
      API_ENDPOINTS.SITECONFIG.CONFIG,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در به‌روزرسانی تنظیمات سایت:", error);
    throw error;
  }
};

// گرفتن تنظیمات صفحه اصلی (HomePage)
export const fetchHomePageConfig = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.SITECONFIG.HOMEPAGE);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات صفحه اصلی:", error);
    throw error;
  }
};

// به‌روزرسانی تنظیمات صفحه اصلی (HomePage)
export const updateHomePageConfig = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "services") {
          // سریالایز کردن آرایه services
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    const response = await axiosInstance.patch(
      API_ENDPOINTS.SITECONFIG.HOMEPAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در به‌روزرسانی تنظیمات صفحه اصلی:", error);
    throw error;
  }
};

// گرفتن تنظیمات درباره ما (AboutUs)
export const fetchAboutUsConfig = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.SITECONFIG.ABOUTUS);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات درباره ما:", error);
    throw error;
  }
};

// به‌روزرسانی تنظیمات درباره ما (AboutUs)
export const updateAboutUsConfig = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "our_team_member") {
          // سریالایز کردن آرایه our_team_member
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    const response = await axiosInstance.patch(
      API_ENDPOINTS.SITECONFIG.ABOUTUS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در به‌روزرسانی تنظیمات درباره ما:", error);
    throw error;
  }
};

// گرفتن تنظیمات تماس با ما (ContactUs)
export const fetchContactUsConfig = async () => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.SITECONFIG.CONTACTUS
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات تماس با ما:", error);
    throw error;
  }
};

// به‌روزرسانی تنظیمات تماس با ما (ContactUs)
export const updateContactUsConfig = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await axiosInstance.patch(
      API_ENDPOINTS.SITECONFIG.CONTACTUS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در به‌روزرسانی تنظیمات تماس با ما:", error);
    throw error;
  }
};
