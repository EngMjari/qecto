// src/config/apiEndpoints.js

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/token/", // ورود و دریافت توکن
    REFRESH: "/api/token/refresh/", // تازه کردن توکن
    LOGOUT: "/api/logout/", // خروج (اگر داری)
    USER_INFO: "/api/user-info/", // گرفتن اطلاعات کاربر جاری
    OTP: "/api/send-otp/",
    VERIFY: "/api/verify-otp/",
  },

  SURVEY: {
    REQUESTS: "/api/survey/requests/",
  },
  EXPERT: {
    REQUESTS: "/api/expert/requests/",
  },
  EXECUTION: {
    REQUESTS: "/api/execution/requests/",
  },
  REGISTRATION: {
    REQUESTS: "/api/registration/requests/",
  },
  SUPERVISION: {
    REQUESTS: "/api/supervision/requests/",
  },

  TICKETS: {
    LIST_CREATE: "/api/tickets/", // لیست و ایجاد تیکت
    DETAIL: (id) => `/api/tickets/${id}/`, // جزئیات تیکت با id
    MESSAGES_CREATE: (sessionId) => `/api/tickets/${sessionId}/messages/`, // ایجاد پیام جدید در تیکت
    UPLOAD_ATTACHMENT: (ticketId, messageId) =>
      `/api/tickets/messages/${ticketId}/${messageId}/attach/`,
  },
  ATTACHMENT: {
    UPLOAD_INIT: "/api/attachments/",
    UPLOAD_ADMIN: (contentType, objectId) =>
      `/api/attachments/upload-admin/${contentType}/${objectId}/`,
    REQUESTS_FILES: (contentType, uuid) =>
      `/api/attachments/request-files/${contentType}/${uuid}/`,
    TICKET_SESSION_FILES: (ticketId) =>
      `/api/attachments/ticket-session-files/${ticketId}/`,
    PREVIEW: (attachmentId) => `/api/attachments/${attachmentId}/preview/`,
  },
  PROJECTS: {
    LIST: "/api/projects/",
    DETAIL: (id) => `/api/projects/${id}/`,
  },
  REQUESTS: {
    LIST: "/api/requests/user/all/",
    DETAIL: "/api/requests/user/",
  },
  SITECONFIG: `api/site/config/`,
};

export default API_ENDPOINTS;
