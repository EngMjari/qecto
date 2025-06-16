import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUserRequests,
  createTicketSession,
  sendTicketMessage,
  getTicketSessionsByRequest,
} from "../../api";
import { FaSearch, FaUpload, FaTimes } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

function NewTicket() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [relatedRequestId, setRelatedRequestId] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [projectNameFilter, setProjectNameFilter] = useState("");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contentTypes, setContentTypes] = useState({});
  const [showRedirectPrompt, setShowRedirectPrompt] = useState(false);
  const [existingTicketId, setExistingTicketId] = useState(null);
  const [requestIdToRedirect, setRequestIdToRedirect] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const requestTypes = {
    survey: "نقشه‌برداری",
    expert: "کارشناسی",
    execution: "اجرا",
    registration: "اخذ سند",
    supervision: "نظارت",
  };

  const requestTypeToModel = {
    survey: "surveyrequest",
    expert: "expertevaluationrequest",
    execution: "executionrequest",
    registration: "registrationrequest",
    supervision: "supervisionrequest",
  };

  // مپینگ موقت ContentType‌ها - جای ID‌های واقعی را بگذارید
  const contentTypeMap = {
    surveyrequest: { model: "surveyrequest", id: 5 }, // جای ID واقعی
    expertevaluationrequest: { model: "expertevaluationrequest", id: 6 },
    executionrequest: { model: "executionrequest", id: 7 },
    registrationrequest: { model: "registrationrequest", id: 8 },
    supervisionrequest: { model: "supervisionrequest", id: 9 },
  };

  useEffect(() => {
    async function loadData() {
      try {
        const requestsData = await fetchUserRequests();
        console.log("Requests loaded:", requestsData.results);
        setRequests(requestsData.results || []);
        setFilteredRequests(requestsData.results || []);

        try {
          const contentTypesResponse = await axiosInstance.get(
            "/api/requests/contenttypes/"
          );
          const contentTypeMap = {};
          contentTypesResponse.data.forEach((ct) => {
            if (Object.values(requestTypeToModel).includes(ct.model)) {
              contentTypeMap[ct.model] = { model: ct.model, id: ct.id };
            }
          });
          setContentTypes(contentTypeMap);
          console.log("ContentTypes لود شده:", contentTypeMap);
        } catch (err) {
          console.warn(
            "خطا در لود ContentType‌ها، استفاده از مقادیر موقت:",
            err
          );
          setContentTypes(contentTypeMap);
        }
      } catch (err) {
        console.error("خطا در دریافت درخواست‌ها:", err);
        setError("دریافت درخواست‌ها با مشکل مواجه شد.");
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (requestTypeFilter) {
      filtered = filtered.filter(
        (req) => req.request_type === requestTypeFilter
      );
    }
    if (projectNameFilter.trim()) {
      filtered = filtered.filter((req) =>
        req.project?.title
          ?.toLowerCase()
          .includes(projectNameFilter.toLowerCase())
      );
    }
    setFilteredRequests(filtered);
  }, [requestTypeFilter, projectNameFilter, requests]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return (
        ["dwg", "dxf", "xlsx", "xls", "pdf", "jpg", "jpeg", "png"].includes(
          ext
        ) && file.size <= 5 * 1024 * 1024
      );
    });
    if (validFiles.length !== selectedFiles.length) {
      setError("برخی فایل‌ها نامعتبر یا بیش از ۵ مگابایت هستند.");
    }
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const checkOpenTicket = async (requestId, requestType) => {
    try {
      console.log(
        `چک کردن تیکت باز برای request_id: ${requestId}, request_type: ${requestType}`
      );
      const response = await getTicketSessionsByRequest(requestId, requestType);
      const openTickets = response.results.filter(
        (ticket) => ticket.status === "open"
      );
      if (openTickets.length > 0) {
        setExistingTicketId(openTickets[0].id);
        setRequestIdToRedirect(requestId);
        setShowRedirectPrompt(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("خطا در بررسی تیکت‌های باز:", err);
      if (err.response?.status === 404) {
        console.warn(
          "درخواست یا نوع درخواست یافت نشد. فرض می‌کنیم تیکت باز وجود ندارد."
        );
        setError(
          "هشدار: درخواست مرتبط یافت نشد، اما می‌توانید تیکت ایجاد کنید."
        );
        return false;
      }
      throw err;
    }
  };

  const handleRedirectConfirm = (confirm) => {
    if (confirm) {
      navigate(`/requests/${requestIdToRedirect}`);
    }
    setShowRedirectPrompt(false);
    setExistingTicketId(null);
    setRequestIdToRedirect(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("لطفا موضوع تیکت را وارد کنید.");
      return;
    }
    if (!content.trim() && files.length === 0) {
      setError("لطفا متن پیام یا فایل ضمیمه وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      let sessionPayload = {
        title,
        session_type: "general",
      };

      if (relatedRequestId) {
        const related = requests.find((r) => r.id === relatedRequestId);
        if (related) {
          const hasOpenTicket = await checkOpenTicket(
            related.id,
            related.request_type
          );
          if (hasOpenTicket) {
            return; // منتظر پاسخ کاربر برای ریدایرکت
          }

          const model = requestTypeToModel[related.request_type];
          const contentType = contentTypes[model] || contentTypeMap[model];
          if (!contentType) {
            console.error(`ContentType برای مدل ${model} یافت نشد.`);
            throw new Error("نوع درخواست نامعتبر است.");
          }
          console.log(
            `ارسال content_type: ${contentType.id} برای ${related.request_type}`
          );
          console.log(`ارسال object_id: ${related.id}`);
          sessionPayload = {
            ...sessionPayload,
            session_type: related.request_type,
            content_type: contentType.id,
            object_id: related.id,
          };
        }
      }

      console.log("ارسال sessionPayload:", sessionPayload);
      const sessionRes = await createTicketSession(sessionPayload);
      const sessionId = sessionRes.id;

      // ارسال پیام اولیه و فایل‌ها
      if (content.trim() || files.length > 0) {
        console.log("ارسال پیام اولیه:", {
          sessionId,
          message: content,
          attachments: files,
        });
        const messageData = {
          message: content || "",
          attachments: files,
        };
        await sendTicketMessage(sessionId, messageData);
      }

      navigate(`/tickets/session/${sessionId}`);
    } catch (err) {
      console.error("خطا در ارسال تیکت:", err.response?.data || err);
      let errorMsg;
      if (err.response?.status === 401) {
        errorMsg = "لطفاً دوباره وارد شوید.";
      } else {
        errorMsg =
          err.response?.data?.content_type?.[0] ||
          err.response?.data?.object_id?.[0] ||
          err.response?.data?.non_field_errors?.[0] ||
          err.message ||
          "ارسال تیکت با مشکل مواجه شد، دوباره تلاش کنید.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content new-ticket-container" dir="rtl">
      <h2>ارسال تیکت جدید</h2>

      {error && <div className="error-message">{error}</div>}

      {showRedirectPrompt && (
        <div className="redirect-prompt">
          <p>
            تیکت باز برای این درخواست وجود دارد. آیا می‌خواهید به صفحه درخواست
            منتقل شوید؟
          </p>
          <button
            onClick={() => handleRedirectConfirm(true)}
            className="confirm-btn"
          >
            بله
          </button>
          <button
            onClick={() => handleRedirectConfirm(false)}
            className="cancel-btn"
          >
            خیر
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="title">موضوع تیکت:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="موضوع تیکت را وارد کنید"
            required
          />
        </div>

        <div className="form-group">
          <label>فیلتر درخواست‌ها:</label>
          <div className="filter-container">
            <select
              value={requestTypeFilter}
              onChange={(e) => setRequestTypeFilter(e.target.value)}
              disabled={loading}
            >
              <option value="">همه انواع</option>
              {Object.entries(requestTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <div className="search-input">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={projectNameFilter}
                onChange={(e) => setProjectNameFilter(e.target.value)}
                placeholder="جستجوی نام پروژه..."
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="relatedRequest">درخواست مرتبط (اختیاری):</label>
          <select
            id="relatedRequest"
            value={relatedRequestId}
            onChange={(e) => setRelatedRequestId(e.target.value)}
            disabled={loading}
          >
            <option value="">عمومی</option>
            {filteredRequests.map((req) => (
              <option key={req.id} value={req.id}>
                {req.project?.title} (
                {requestTypes[req.request_type] || req.request_type})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">متن پیام اولیه (اختیاری):</label>
          <textarea
            id="content"
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            placeholder="پیام خود را بنویسید..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>فایل‌های ضمیمه (اختیاری):</label>
          <div
            className={`file-upload-area ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <FaUpload className="upload-icon" />
            <p>فایل‌ها را اینجا بکشید و رها کنید یا کلیک کنید برای انتخاب</p>
            <input
              id="files"
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
              accept=".dwg,.dxf,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
            />
          </div>
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, index) => (
                <li key={index} className="file-item">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="remove-file-btn"
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "در حال ارسال..." : "ارسال تیکت"}
        </button>
      </form>

      <style jsx>{`
        .page-content {
          margin-top: 80px;
        }

        @media (max-width: 1024px) {
          .page-content {
            margin-top: 64px;
            margin-bottom: 96px;
          }
        }

        .new-ticket-container {
          max-width: 700px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          font-family: Vazir, sans-serif;
          color: #002a3a;
        }

        h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #ff5700;
          font-weight: 700;
          font-size: 1.8rem;
        }

        .error-message {
          background-color: #fdecea;
          color: #d32f2f;
          padding: 12px;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }

        .redirect-prompt {
          background-color: #e6f3ff;
          color: #002a3a;
          padding: 12px;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .redirect-prompt p {
          margin: 0 0 12px;
          font-weight: 600;
        }

        .confirm-btn,
        .cancel-btn {
          padding: 8px 16px;
          margin: 0 8px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .confirm-btn {
          background-color: #ff5700;
          color: white;
        }

        .confirm-btn:hover {
          background-color: #e04e00;
        }

        .cancel-btn {
          background-color: #d1d5db;
          color: #002a3a;
        }

        .cancel-btn:hover {
          background-color: #b0b5bd;
        }

        .ticket-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #002a3a;
        }

        .form-group input[type="text"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          color: #002a3a;
          transition: border-color 0.3s ease;
        }

        .form-group input[type="text"]:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff5700;
          box-shadow: 0 0 8px #ff5700aa;
        }

        .filter-container {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-container select {
          flex: 1;
          min-width: 150px;
        }

        .search-input {
          position: relative;
          flex: 2;
          min-width: 200px;
        }

        .search-input input {
          padding-left: 2.5rem;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 1rem;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .file-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .file-upload-area:hover {
          border-color: #ff5700;
          background: #fff7ed;
        }

        .file-upload-area.dragging {
          border-color: #ff5700;
          background: #fff7ed;
          box-shadow: 0 0 10px #ff5700aa;
        }

        .upload-icon {
          font-size: 2rem;
          color: #ff5700;
          margin-bottom: 0.5rem;
        }

        .file-upload-area p {
          margin: 0;
          color: #4b5563;
          font-size: 1rem;
        }

        .file-list {
          margin-top: 1rem;
          list-style: none;
          padding: 0;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .remove-file-btn {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .remove-file-btn:hover:not(:disabled) {
          color: #b91c1c;
        }

        .remove-file-btn:disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .submit-btn {
          padding: 14px;
          background-color: #ff5700;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .submit-btn:disabled {
          background-color: #ffa066;
          cursor: not-allowed;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #e04e00;
        }

        @media (max-width: 600px) {
          .new-ticket-container {
            margin: 1rem;
            padding: 1.5rem;
          }

          .filter-container {
            flex-direction: column;
          }

          .filter-container select,
          .search-input {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default NewTicket;
