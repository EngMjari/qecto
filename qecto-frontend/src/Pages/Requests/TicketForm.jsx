import React, { useState } from "react";
import {
  createTicketSession,
  createTicketMessage,
  uploadMessageFiles,
} from "../../api/ticketsApi";
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
      const formData = new FormData();
      formData.append("title", title);
      formData.append("session_type", requestType);
      if (requestType === "survey") {
        formData.append("survey_request", requestId);
      } else if (requestType === "expert" || requestType === "evaluation") {
        formData.append("evaluation_request", requestId);
      }

      // لاگ گرفتن دیتا قبل از ارسال
      for (let pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      const sessionRes = await createTicketSession(formData);
      const sessionId = sessionRes.data.id;

      // اگر پیام یا فایل وجود دارد، پیام اولیه بساز
      if ((message && message.trim()) || files.length > 0) {
        const msgRes = await createTicketMessage(sessionId, {
          content: message && message.trim() ? message : " ",
        });
        const messageId = msgRes.data.id;

        if (files.length > 0) {
          const fileForm = new FormData();
          files.forEach((file, idx) => {
            fileForm.append("files", file);
            fileForm.append("titles", fileTitles[idx] || "");
          });
          await uploadMessageFiles(messageId, fileForm);
        }
      }

      setTitle("");
      setMessage("");
      setFiles([]);
      setFileTitles([]);
      setSuccessMsg("تیکت با موفقیت ثبت شد.");
      onTicketCreated();
    } catch (err) {
      setErrorMsg("خطا در ثبت تیکت. لطفاً دوباره تلاش کنید.");
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
          required
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
          loading ||
          !title.trim() ||
          !message.trim() ||
          message.length > MAX_MESSAGE_LENGTH
        }
      >
        {loading && <FaSpinner className="animate-spin" />}
        ارسال تیکت
      </button>
    </form>
  );
}

export default TicketForm;
