import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "api/tickets/";

// گرفتن لیست تیکت‌ها (برای کاربر عادی فقط تیکت‌های خودش، برای ادمین همه)
export const fetchTicketSessions = async () => {
  try {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت لیست تیکت‌ها:", error);
    throw error;
  }
};

// گرفتن جزئیات یک تیکت خاص به همراه پیام‌ها
export const fetchTicketDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت جزئیات تیکت:", error);
    throw error;
  }
};

// ایجاد یک تیکت جدید
export const createTicket = async (ticketData) => {
  try {
    const response = await axiosInstance.post(BASE_URL, ticketData);
    return response.data;
  } catch (error) {
    console.error("خطا در ایجاد تیکت:", error);
    throw error;
  }
};

// ارسال پیام جدید به یک تیکت (با شناسه session)
export const sendTicketMessage = async (sessionId, messageData) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}${sessionId}/messages/`,
      messageData
    );
    return response.data;
  } catch (error) {
    console.error("خطا در ارسال پیام:", error);
    throw error;
  }
};
