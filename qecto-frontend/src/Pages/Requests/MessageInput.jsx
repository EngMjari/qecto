import React, { useState, useRef } from "react";
import { FaPaperclip, FaPaperPlane, FaLock } from "react-icons/fa";
import FileItemForSelectedFiles from "./FileItemForSelectedFiles";

function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() === "" && files.length === 0) return;
    onSendMessage(message, files);
    setMessage("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleRemoveFile = (idx) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== idx);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return newFiles;
    });
  };

  return (
    <div className="p-4 bg-gray-200 border-t rounded rounded-lg w-full">
      {disabled ? (
        <div className="text-center text-sm text-gray-500 p-3 bg-gray-200 rounded-lg flex items-center justify-center">
          <FaLock className="w-4 h-4 ml-2" />
          <span>این گفتگو بسته شده است.</span>
        </div>
      ) : (
        <div className="flex items-center border border-gray-300 rounded-lg p-1 bg-white focus-within:ring-2 focus-within:ring-blue-500 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="پاسخ خود را بنویسید..."
            className="flex-grow bg-transparent outline-none px-4 text-gray-700 min-w-0"
            style={{ fontSize: "clamp(13px, 3vw, 16px)" }}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:text-blue-600 flex-shrink-0"
            type="button"
          >
            <FaPaperclip className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white rounded-full p-2.5 hover:bg-blue-700 transition-transform transform active:scale-95 flex-shrink-0"
            style={{ minWidth: 40, minHeight: 40 }}
            type="button"
          >
            <FaPaperPlane className="h-5 w-5" />
          </button>
        </div>
      )}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {files.map((file, idx) => (
            <FileItemForSelectedFiles
              key={idx}
              file={file}
              onRemove={() => handleRemoveFile(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageInput;
