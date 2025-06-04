import axiosInstance from "../utils/axiosInstance";

// دریافت لیست تیکت‌ها
export const fetchTickets = () => {
  return axiosInstance.get("/api/tickets/");
};

// دریافت جزئیات یک تیکت با آیدی
export const fetchTicketDetails = (ticketId) => {
  return axiosInstance.get(`/api/tickets/${ticketId}/`);
};

// ارسال تیکت جدید
export const createTicket = (ticketData) => {
  return axiosInstance.post("/api/tickets/", ticketData);
};

// بستن تیکت (مثلا با تغییر وضعیت)
export const closeTicket = (ticketId) => {
  return axiosInstance.post(`/api/tickets/${ticketId}/close/`);
};

// ارسال پاسخ یا پیوست به تیکت
export const replyToTicket = (ticketId, replyData) => {
  return axiosInstance.post(`/api/tickets/${ticketId}/reply/`, replyData);
};
