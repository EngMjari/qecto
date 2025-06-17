// api :
import axiosInstance from "../utils/axiosInstance";

export const createTicketSession = async (data) => {
  try {
    const response = await axiosInstance.post("/api/tickets/sessions/", data);
    return response.data;
  } catch (error) {
    console.error("خطا در ایجاد سشن تیکت:", error.response?.data || error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const fetchTicketSessions = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/tickets/sessions/", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت سشن‌های تیکت:", error.response?.data || error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const fetchTicketSessionDetail = async (sessionId) => {
  try {
    const response = await axiosInstance.get(
      `/api/tickets/sessions/${sessionId}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات سشن:", error.response?.data || error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const sendTicketMessage = async (sessionId, data) => {
  try {
    const formData = new FormData();
    formData.append("message", data.message || "");

    if (data.attachments && Array.isArray(data.attachments)) {
      data.attachments.forEach((attachment, index) => {
        if (attachment instanceof File) {
          formData.append("attachments", attachment); // تست با attachments بدون []
        } else if (attachment && attachment.file instanceof File) {
          formData.append("attachments", attachment.file); // تست با attachments بدون []
        } else {
          console.warn(`فایل نامعتبر در ایندکس ${index}`);
        }
      });
    }

    // لاگ برای دیباگ
    for (let [key, value] of formData.entries()) {
      console.log(
        `FormData: ${key} = ${value instanceof File ? value.name : value}`
      );
    }

    const response = await axiosInstance.post(
      `/api/tickets/sessions/${sessionId}/`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پیام تیکت:", error.response?.data || error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const getTicketSessionsByRequest = async (requestId, requestType) => {
  try {
    const response = await axiosInstance.get(
      `/api/tickets/sessions/by-request/${requestId}/${requestType}/`
    );
    return response.data;
  } catch (error) {
    console.error(
      `خطا در دریافت سشن‌های تیکت برای ${requestType}:`,
      error.response?.data || error
    );
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const reopenTicketSession = async (sessionId) => {
  try {
    const response = await axiosInstance.post(
      `/api/tickets/sessions/${sessionId}/reopen/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در باز کردن سشن تیکت:", error.response?.data || error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const closeTicketSession = async (sessionId, data) => {
  try {
    const response = await axiosInstance.post(
      `/api/tickets/sessions/${sessionId}/close/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("خطا در بستن سشن تیکت:", error.response?.data || error);
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};
