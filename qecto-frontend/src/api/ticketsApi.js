import axiosInstance from "../utils/axiosInstance";

export const createTicketSession = async (data) => {
  try {
    const response = await axiosInstance.post("/api/tickets/sessions/", data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating ticket session:",
      error.response?.data || error
    );
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
    console.error(
      "Error fetching ticket sessions:",
      error.response?.data || error
    );
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const fetchAllTicketSessions = async (params = {}) => {
  try {
    let allTickets = [];
    let page = 1;
    const pageSize = 50; // اندازه صفحه برای هر درخواست

    while (true) {
      const response = await fetchTicketSessions({
        ...params,
        page,
        page_size: pageSize,
      });

      const results = Array.isArray(response.results?.results)
        ? response.results.results
        : Array.isArray(response.results)
        ? response.results
        : [];

      allTickets.push(...results);

      // بررسی وجود صفحه بعدی
      if (!response.results?.next || results.length < pageSize) {
        break;
      }
      page++;
    }

    return { results: allTickets }; // ساختار ساده‌تر برای سازگاری
  } catch (error) {
    console.error(
      "Error fetching all ticket sessions:",
      error.response?.data || error
    );
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
    console.error(
      "Error fetching session details:",
      error.response?.data || error
    );
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
          formData.append("attachments", attachment);
        } else if (attachment && attachment.file instanceof File) {
          formData.append("attachments", attachment.file);
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
    console.error(
      "Error sending ticket message:",
      error.response?.data || error
    );
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
      `Error fetching ticket sessions for ${requestType}:`,
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
    console.error(
      "Error reopening ticket session:",
      error.response?.data || error
    );
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
    console.error(
      "Error closing ticket session:",
      error.response?.data || error
    );
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};

export const createPublicTicket = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/api/tickets/public-ticket/",
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating public ticket:",
      error.response?.data || error
    );
    throw error.response?.data || { error: "خطای ناشناخته" };
  }
};
