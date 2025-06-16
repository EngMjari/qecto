// Pages/Requests/Components/MessageInput.jsx :
import React, { useState, useRef } from "react";
import { FaPaperclip, FaPaperPlane, FaLock } from "react-icons/fa";
import FileItemForSelectedFiles from "./FileItemForSelectedFiles";

function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [fileTitles, setFileTitles] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).filter((file) => {
      const maxSize = 5 * 1024 * 1024; // ۵ مگابایت
      const allowedExtensions = [
        ".dwg",
        ".dxf",
        ".xlsx",
        ".xls",
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
      ];
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (file.size > maxSize) {
        setError(`فایل ${file.name} بیش از ۵ مگابایت است.`);
        return false;
      }
      if (!allowedExtensions.includes(ext)) {
        setError(`فرمت فایل ${file.name} مجاز نیست.`);
        return false;
      }
      return true;
    });
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      setFileTitles((prev) => [...prev, ...newFiles.map(() => "")]);
      setError(null);
    }
  };

  const handleSend = async () => {
    if (disabled || (message.trim() === "" && files.length === 0)) {
      setError("پیام یا فایل الزامی است.");
      return;
    }
    setError(null);
    try {
      console.log("files : ", files);
      await onSendMessage(
        message,
        files.map((file, index) => ({
          file,
          title: fileTitles[index] || "",
        }))
      );
      setMessage("");
      setFiles([]);
      setFileTitles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      const errorMsg =
        error.non_field_errors?.[0] || error.error || "خطا در ارسال پیام";
      setError(errorMsg);
    }
  };

  const handleRemoveFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFileTitles((prev) => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTitleChange = (index, value) => {
    setFileTitles((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  return (
    <div className="w-full bg-gray-50 border-gray-200 rounded-b-lg">
      {disabled ? (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-200 text-gray-600 text-sm font-medium select-none shadow-inner">
          <FaLock className="w-4 h-4" />
          <span>این گفتگو بسته شده است.</span>
        </div>
      ) : (
        <>
          {error && <div className="text-red-500 p-2 text-sm">{error}</div>}
          <div
            className="flex items-center bg-white rounded-full shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-150"
            style={{ gap: "0.6rem" }}
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="پیام خود را بنویسید..."
              className="flex-grow resize-none bg-transparent outline-none text-gray-800 placeholder-gray-400 font-normal"
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                minHeight: 36,
                maxHeight: 96,
                lineHeight: 1.4,
                padding: "6px 0",
              }}
              rows={1}
            />
            <button
              type="button"
              title="افزودن فایل"
              onClick={() => fileInputRef.current.click()}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-150 flex items-center justify-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Attach files"
            >
              <FaPaperclip className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".dwg,.dxf,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() && files.length === 0}
              title="ارسال پیام"
              className={`flex items-center justify-center rounded-full p-3 min-w-[44px] min-h-[44px] transition-transform duration-150 ${
                message.trim() || files.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              aria-disabled={!message.trim() && files.length === 0}
            >
              <FaPaperPlane className="w-5 h-5" />
            </button>
          </div>

          {files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 max-w-full">
              {files.map((file, idx) => (
                <FileItemForSelectedFiles
                  key={idx}
                  file={file}
                  index={idx}
                  onRemove={() => handleRemoveFile(idx)}
                  title={fileTitles[idx]}
                  onTitleChange={handleTitleChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MessageInput;
