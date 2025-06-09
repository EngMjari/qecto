import React from "react";
import { FaShieldAlt, FaUser, FaFileAlt } from "react-icons/fa";

function MessageBubble({ message }) {
  const isAdmin =
    !!message.sender_admin ||
    (message.sender && message.sender.role === "admin");
  return (
    <div
      className={`flex items-end gap-2 my-2 ${
        isAdmin ? "justify-start" : "justify-end"
      }`}
    >
      {isAdmin && <FaShieldAlt className="w-6 h-6 text-blue-400" />}
      <div
        className={`max-w-md p-3 rounded-lg shadow break-words whitespace-pre-line ${
          isAdmin
            ? "bg-blue-50 text-blue-900 rounded-bbr-none"
            : "bg-blue-600 text-white rounded-bbl-none"
        }`}
        style={{
          borderBottomRightRadius: isAdmin ? 0 : undefined,
          borderBottomLeftRadius: !isAdmin ? 0 : undefined,
          fontSize: "clamp(13px, 3vw, 16px)",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <p className="text-sm">{message.content}</p>
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.files.map((file) => (
              <a
                key={file.id}
                href={file.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white border px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50"
                download
              >
                <FaFileAlt className="ml-1" />
                {file.custom_name || file.file.split("/").pop()}
              </a>
            ))}
          </div>
        )}
        <p
          className={`text-xs mt-1 opacity-70 ${
            isAdmin ? "text-right" : "text-left"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {!isAdmin && <FaUser className="w-6 h-6 text-gray-400" />}
      {isAdmin && <span className="text-xs text-blue-600 ml-2">کارشناس</span>}
    </div>
  );
}

export default MessageBubble;
