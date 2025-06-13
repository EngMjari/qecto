import axiosInstance from "../utils/axiosInstance";

export const createTicketSession = async (data) => {
  try {
    const response = await axiosInstance.post("/api/tickets/sessions/", data);
    return response.data;
  } catch (error) {
    console.error("خطا در ایجاد سشن تیکت:", error);
    throw error;
  }
};

export const fetchTicketSessions = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/tickets/sessions/", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت سشن‌های تیکت:", error);
    throw error;
  }
};

export const fetchTicketSessionDetail = async (sessionId) => {
  try {
    const response = await axiosInstance.get(
      `/api/tickets/sessions/${sessionId}/`
    );
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات سشن:", error);
    throw error;
  }
};

export const sendTicketMessage = async (sessionId, data) => {
  try {
    const formData = new FormData();
    formData.append("message", data.message);
    if (data.attachments && Array.isArray(data.attachments)) {
      data.attachments.forEach(({ file, title }) => {
        formData.append("attachments", file);
        formData.append("attachments[].title", title || "");
      });
    }
    const response = await axiosInstance.post(
      `/api/tickets/sessions/${sessionId}/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پیام تیکت:", error);
    throw error;
  }
};

export const closeTicketSession = async (sessionId, reason = "") => {
  try {
    const response = await axiosInstance.post(
      `/api/tickets/sessions/${sessionId}/close/`,
      { reason }
    );
    return response.data;
  } catch (error) {
    console.error("خطا در بستن سشن تیکت:", error);
    throw error;
  }
};

export const getTicketSessionsByRequest = async (requestId, requestType) => {
  try {
    const response = await axiosInstance.get(
      `/api/tickets/sessions/by-request/${requestId}/${requestType}/`
    );
    return response.data;
  } catch (error) {
    console.error(`خطا در دریافت سشن‌های تیکت برای ${requestType}:`, error);
    throw error;
  }
};
