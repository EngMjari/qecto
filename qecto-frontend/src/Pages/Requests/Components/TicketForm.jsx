import React, { useState } from "react";
import { createTicketSession, sendTicketMessage } from "../../../api";
import { FaPaperclip, FaSpinner } from "react-icons/fa";
import FileItemForSelectedFiles from "./FileItemForSelectedFiles";

const MAX_MESSAGE_LENGTH = 1000;

function TicketForm({ requestId, requestType, onTicketCreated }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [fileTitles, setFileTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
    setFileTitles([...fileTitles, ...newFiles.map(() => "")]);
    e.target.value = "";
  };

  const handleRemoveFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
    setFileTitles(fileTitles.filter((_, i) => i !== idx));
  };

  const handleFileTitleChange = (idx, value) => {
    const updated = [...fileTitles];
    updated[idx] = value;
    setFileTitles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      // بررسی مقادیر ورودی
      if (!requestId || !requestType) {
        throw new Error("شناسه درخواست یا نوع درخواست نامعتبر است.");
      }
      const validRequestTypes = [
        "survey",
        "expert",
        "evaluation",
        "supervision",
        "execution",
        "registration",
      ];
      if (!validRequestTypes.includes(requestType)) {
        throw new Error(`نوع درخواست نامعتبر است: ${requestType}`);
      }

      // نگاشت requestType به content_type
      const contentTypeMap = {
        survey: "surveyrequest",
        expert: "expertevaluationrequest",
        evaluation: "expertevaluationrequest",
        supervision: "supervisionrequest",
        execution: "executionrequest",
        registration: "registrationrequest",
      };
      const content_type = contentTypeMap[requestType];
      if (!content_type) {
        throw new Error(`content_type نامعتبر برای ${requestType}`);
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("session_type", requestType);
      formData.append("content_type", content_type);
      formData.append("object_id", requestId);

      // لاگ فرم دیتا
      for (let pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      const sessionRes = await createTicketSession(formData);
      const sessionId = sessionRes.id;

      // ارسال پیام اولیه اگر وجود داشته باشد
      if (message.trim() || files.length > 0) {
        await sendTicketMessage(sessionId, {
          message: message.trim() || " ",
          attachments: files.map((file, idx) => ({
            file,
            title: fileTitles[idx] || "",
          })),
        });
      }

      setTitle("");
      setMessage("");
      setFiles([]);
      setFileTitles([]);
      setSuccessMsg("تیکت با موفقیت ثبت شد.");
      onTicketCreated();
    } catch (err) {
      console.error("جزئیات خطا:", err.response?.data || err.message);
      setErrorMsg(
        `خطا در ثبت تیکت: ${
          err.response?.data?.non_field_errors?.[0] || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-xl shadow"
    >
      <h3 className="font-bold text-lg mb-2">ارسال تیکت جدید</h3>
      {successMsg && (
        <div className="bg-green-100 text-green-700 p-2 rounded text-center font-bold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-center font-bold">
          {errorMsg}
        </div>
      )}
      <input
        type="text"
        className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
        placeholder="عنوان تیکت"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={100}
      />
      <div className="relative">
        <textarea
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
          placeholder="متن پیام"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
          }
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <span className="absolute left-2 bottom-2 text-xs text-gray-400">
          {MAX_MESSAGE_LENGTH - message.length} کاراکتر باقی‌مانده
        </span>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800">
          <FaPaperclip />
          <span>افزودن فایل</span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {files.map((file, idx) => (
              <FileItemForSelectedFiles
                key={idx}
                file={file}
                index={idx}
                onRemove={handleRemoveFile}
                title={fileTitles[idx]}
                onTitleChange={handleFileTitleChange}
              />
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        className={`bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
        disabled={
          loading || !title.trim() || message.length > MAX_MESSAGE_LENGTH
        }
      >
        {loading && <FaSpinner className="animate-spin" />}
        ارسال تیکت
      </button>
    </form>
  );
}

export default TicketForm;
