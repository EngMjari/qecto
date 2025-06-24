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

  const contentTypeMap = {
    surveyrequest: { model: "surveyrequest", id: 5 },
    expertevaluationrequest: { model: "expertevaluationrequest", id: 6 },
    executionrequest: { model: "executionrequest", id: 7 },
    registrationrequest: { model: "registrationrequest", id: 8 },
    supervisionrequest: { model: "supervisionrequest", id: 9 },
  };

  useEffect(() => {
    async function loadData() {
      try {
        const requestsData = await fetchUserRequests();
        setRequests(requestsData.results || []);
        setFilteredRequests(requestsData.results || []);
        console.log(requestsData.results);

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
        } catch (err) {
          setContentTypes(contentTypeMap);
        }
      } catch (err) {
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
        req?.project_title
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
      const response = await getTicketSessionsByRequest(requestId, requestType);
      const openTickets = response.results.filter(
        (ticket) => ticket.status === "open"
      );
      if (openTickets.length > 0) {
        setRequestIdToRedirect(requestId);
        setShowRedirectPrompt(true);
        return true;
      }
      return false;
    } catch (err) {
      if (err.response?.status === 404) {
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
            return;
          }

          const model = requestTypeToModel[related.request_type];
          const contentType = contentTypes[model] || contentTypeMap[model];
          if (!contentType) {
            throw new Error("نوع درخواست نامعتبر است.");
          }
          sessionPayload = {
            ...sessionPayload,
            session_type: related.request_type,
            content_type: contentType.id,
            object_id: related.id,
          };
        }
      }

      const sessionRes = await createTicketSession(sessionPayload);
      const sessionId = sessionRes.id;

      if (content.trim() || files.length > 0) {
        const messageData = {
          message: content || "",
          attachments: files,
        };
        await sendTicketMessage(sessionId, messageData);
      }

      navigate(`/tickets/session/${sessionId}`);
    } catch (err) {
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
    <div className="page-content pt-0.5 pb-24 md:pb-4 md:pt-6 bg-white">
      <div
        className="w-full max-w-2xl p-3 mx-auto bg-white rounded-xl shadow-lg font-vazir text-gray-900 animate-fade-in"
        dir="rtl"
      >
        <h2 className="text-center text-2xl font-bold text-orange-500 mb-8 animate-pulse">
          ارسال تیکت جدید
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        {showRedirectPrompt && (
          <div className="bg-blue-100 text-gray-900 p-3 rounded-lg mb-4 text-center animate-slide-in">
            <p className="font-medium mb-3">
              تیکت باز برای این درخواست وجود دارد. آیا می‌خواهید به صفحه درخواست
              منتقل شوید؟
            </p>
            <button
              onClick={() => handleRedirectConfirm(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg mx-2 hover:bg-orange-600 transition-colors duration-200"
            >
              بله
            </button>
            <button
              onClick={() => handleRedirectConfirm(false)}
              className="bg-gray-400 text-gray-900 px-4 py-2 rounded-lg mx-2 hover:bg-gray-200 transition-colors duration-200"
            >
              خیر
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-900">
              موضوع تیکت:
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="موضوع تیکت را وارد کنید"
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 box-border"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-900">
              فیلتر درخواست‌ها:
            </label>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <select
                value={requestTypeFilter}
                onChange={(e) => setRequestTypeFilter(e.target.value)}
                disabled={loading}
                className="flex-1 min-w-[150px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 box-border"
              >
                <option value="">همه انواع</option>
                {Object.entries(requestTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="relative flex-2 min-w-[200px]">
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={projectNameFilter}
                  onChange={(e) => setProjectNameFilter(e.target.value)}
                  placeholder="جستجوی نام پروژه..."
                  disabled={loading}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 box-border"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-900">
              درخواست مرتبط (اختیاری):
            </label>
            <select
              id="relatedRequest"
              value={relatedRequestId}
              onChange={(e) => setRelatedRequestId(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 box-border"
            >
              <option value="">عمومی</option>
              {filteredRequests.map((req) => (
                <option key={req.id} value={req.id}>
                  {req?.project_title} (
                  {requestTypes[req.request_type] || req.request_type})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-900">
              متن پیام اولیه (اختیاری):
            </label>
            <textarea
              id="content"
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              placeholder="پیام خود را بنویسید..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 box-border resize-vertical max-h-60"
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-900">
              فایل‌های ضمیمه (اختیاری):
            </label>
            <div
              className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-orange-500 bg-orange-50 shadow-lg"
                  : "hover:border-orange-500 hover:bg-orange-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <FaUpload className="text-orange-500 text-3xl mx-auto mb-2 animate-bounce" />
              <p className="text-gray-600">
                فایل‌ها را اینجا بکشید و رها کنید یا کلیک کنید برای انتخاب
              </p>
              <input
                id="files"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={loading}
                accept=".dwg,.dxf,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </div>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto w-full">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-100 rounded-lg animate-slide-in"
                  >
                    <span className="text-gray-700 text-sm truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed p-1 transition-colors duration-300"
                      disabled={loading}
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white p-4 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all duration-200 animate-pulse"
          >
            {loading ? "در حال ارسال..." : "ارسال تیکت"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTicket;
