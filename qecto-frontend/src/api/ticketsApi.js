// src/api/ticketsApi.js
import axiosInstance from "../utils/axiosInstance";

// لیست تمام سشن‌هایی که کاربر مجاز به دیدن آنهاست
export const getTicketSessions = () => {
  return axiosInstance.get("/api/tickets/sessions/");
};

// ایجاد یک سشن جدید
export const createTicketSession = (data) => {
  return axiosInstance.post("/api/tickets/sessions/", data);
};

// دریافت جزئیات یک سشن خاص
export const getTicketSessionById = (id) => {
  return axiosInstance.get(`/api/tickets/sessions/${id}/`);
};

// آپدیت کردن اطلاعات یک سشن (فقط ادمین‌ها یا سوپر یوزر)
export const updateTicketSession = (id, data) => {
  return axiosInstance.patch(`/api/tickets/sessions/${id}/`, data);
};

// گرفتن پیام‌های مربوط به یک سشن
export const getTicketMessages = (sessionId) => {
  return axiosInstance.get(`/api/tickets/sessions/${sessionId}/messages/`);
};

// ارسال پیام جدید در یک سشن
export const createTicketMessage = (sessionId, data) => {
  return axiosInstance.post(
    `/api/tickets/sessions/${sessionId}/messages/`,
    data
  );
};

// آپلود فایل برای یک پیام
export const uploadMessageFiles = (messageId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  return axiosInstance.post(
    `/api/tickets/messages/${messageId}/upload/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// گرفتن سشن‌های مربوط به یک survey_request
export const getTicketSessionsBySurveyRequest = (surveyRequestId) => {
  return axiosInstance.get(
    `/api/tickets/sessions/?survey_request=${surveyRequestId}`
  );
};

// گرفتن سشن‌های مربوط به یک evaluation_request
export const getTicketSessionsByEvaluationRequest = (evaluationRequestId) => {
  return axiosInstance.get(
    `/api/tickets/sessions/?evaluation_request=${evaluationRequestId}`
  );
};
