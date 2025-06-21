import axiosInstance from "../utils/axiosInstance";
import API_ENDPOINTS from "./apiEndpoints";
export const uploadInitialAttachment = async (
  contentType,
  objectId,
  file,
  title
) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("حجم فایل باید کمتر از ۵ مگابایت باشد.");
    }
    const ext = file.name.split(".").pop().toLowerCase();
    if (
      !["dwg", "dxf", "xlsx", "xls", "pdf", "jpg", "jpeg", "png"].includes(ext)
    ) {
      throw new Error("فرمت فایل غیرمجاز است.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("content_type", contentType);
    formData.append("object_id", objectId);
    const response = await axiosInstance.post(
      API_ENDPOINTS.ATTACHMENT.UPLOAD_INIT,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در آپلود فایل اولیه:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const uploadAdminAttachment = async (
  contentType,
  objectId,
  file,
  title
) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("حجم فایل باید کمتر از ۵ مگابایت باشد.");
    }
    const ext = file.name.split(".").pop().toLowerCase();
    if (
      !["dwg", "dxf", "xlsx", "xls", "pdf", "jpg", "jpeg", "png"].includes(ext)
    ) {
      throw new Error("فرمت فایل غیرمجاز است.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("content_type", contentType);
    formData.append("object_id", objectId);
    const response = await axiosInstance.post(
      (API_ENDPOINTS.ATTACHMENT.UPLOAD_ADMIN, contentType, objectId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در آپلود فایل ادمین:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const uploadTicketAttachment = async (
  ticketId,
  messageId,
  file,
  title
) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("حجم فایل باید کمتر از ۵ مگابایت باشد.");
    }
    const ext = file.name.split(".").pop().toLowerCase();
    if (
      !["dwg", "dxf", "xlsx", "xls", "pdf", "jpg", "jpeg", "png"].includes(ext)
    ) {
      throw new Error("فرمت فایل غیرمجاز است.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    const response = await axiosInstance.post(
      API_ENDPOINTS.TICKETS.UPLOAD_ATTACHMENT,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در آپلود فایل تیکت:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const fetchRequestFiles = async (contentType, uuid) => {
  try {
    const response = await axiosInstance.get(
      (API_ENDPOINTS.ATTACHMENT.REQUESTS_FILES, contentType, uuid)
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت فایل‌های درخواست:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const fetchTicketSessionFiles = async (ticketId) => {
  try {
    const response = await axiosInstance.get(
      (API_ENDPOINTS.ATTACHMENT.TICKET_SESSION_FILES, ticketId)
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت فایل‌های سشن تیکت:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const getFilePreview = async (attachmentId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.ATTACHMENT.PREVIEW, {
      responseType: "blob",
    });
    const blob = response.data;
    const contentType = response.headers["content-type"];
    if (contentType === "application/json") {
      // اگر پاسخ JSON باشه (مثل ارور)، متنش رو بخون
      const text = await blob.text();
      const errorData = JSON.parse(text);
      throw errorData;
    }
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("خطا در دریافت پیش‌نمایش:", error);
    throw error.error ? error : { error: "خطای ناشناخته در پیش‌نمایش" };
  }
};
