import axiosInstance from "./axiosInstance";

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
    const response = await axiosInstance.post("/api/attachments/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
      `/api/attachments/upload-admin/${contentType}/${objectId}/`,
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
      `/api/tickets/messages/${ticketId}/${messageId}/attach/`,
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
      `/api/attachments/request-files/${contentType}/${uuid}/`
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
      `/api/attachments/ticket-session-files/${ticketId}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت فایل‌های سشن تیکت:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const getFilePreview = async (attachmentId) => {
  try {
    const response = await axiosInstance.get(
      `/api/attachments/${attachmentId}/preview/`,
      {
        responseType: "blob",
      }
    );
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("خطا در دریافت پیش‌نمایش:", error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};
