import React from "react";
import { FaShieldAlt, FaUser, FaFileAlt } from "react-icons/fa";

function MessageBubble({ message, userId }) {
  const isAdmin = message.sender.id !== userId;

  return (
    <div
      className={`flex flex-col items-start gap-1 my-4 ${
        isAdmin ? "items-start" : "items-end"
      }`}
    >
      {/* نام و آواتار بالا */}
      <div
        className={`flex items-center gap-2 mb-1 ${
          isAdmin ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
            isAdmin ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {isAdmin ? (
            <FaShieldAlt className="w-4 h-4" />
          ) : (
            <FaUser className="w-4 h-4" />
          )}
        </div>
        <span
          className={`text-xs font-semibold ${
            isAdmin ? "text-gray-500" : "text-blue-600"
          }`}
        >
          {isAdmin ? "ادمین" : "کاربر"}
        </span>
      </div>

      {/* حباب پیام */}
      <div
        className={`max-w-xs sm:max-w-md pt-2 px-4 rounded-2xl shadow-md transition-all duration-200 break-words whitespace-pre-wrap ${
          isAdmin
            ? "bg-gray-100 text-gray-900 rounded-tr-none"
            : "bg-blue-600 text-white rounded-tl-none"
        }`}
        style={{
          fontSize: "clamp(14px, 3vw, 16px)",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <p className="text-sm leading-relaxed text-justify">
          {message.message || ""}
        </p>

        {message.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.attachments.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white/80 border border-gray-200 px-3 py-2 rounded text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                download
              >
                {/* TODO: add file size */}
                <FaFileAlt className="ml-1 w-4 h-4" />
                {file.title || file.file_url.split("/").pop()}
              </a>
            ))}
          </div>
        )}

        <p
          className={`text-xs mt-2 opacity-60 ${
            isAdmin ? "text-right" : "text-left"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default MessageBubble;
