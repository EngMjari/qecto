import React from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import getFileIcon from "./getFileIcon";

function formatFileSize(sizeInBytes) {
  if (typeof sizeInBytes !== "number") return "";

  if (sizeInBytes >= 1024 * 1024) {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + " مگابایت";
  } else if (sizeInBytes >= 1024) {
    return (sizeInBytes / 1024).toFixed(1) + " کیلوبایت";
  } else {
    return sizeInBytes + " بایت";
  }
}

function FileItem({ file, ticketTitle, onPreview, isAdmin }) {
  const ext = (file.file_extension || "").toLowerCase();
  const canPreview = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "pdf",
  ].includes(ext);

  return (
    <div className="flex flex-col w-full my-">
      <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-200 w-full">
        {getFileIcon(file)}
        <div className="flex-grow">
          <p className="font-semibold text-sm text-gray-800">
            {file.custom_name || file.title || file.file.split("/").pop()}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">
              {file.file_extension?.toUpperCase() || ""}
            </span>
            <span className="text-xs text-gray-400">
              {formatFileSize(file.readable_file_size) || ""}
            </span>
            <span className="text-xs text-gray-400">
              {file.uploaded_at
                ? new Date(file.uploaded_at).toLocaleDateString("fa-IR")
                : ""}
            </span>
          </div>
          {ticketTitle && (
            <span className="block text-xs text-gray-500 mt-1">
              فایل مربوط به تیکت "{ticketTitle}"
              {isAdmin && (
                <span className="text-xs text-blue-600 ml-2">(کارشناس)</span>
              )}
            </span>
          )}
        </div>
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            className="p-2 rounded-full text-blue-500 hover:bg-blue-100 transition-colors ml-1"
            title="پیش‌نمایش"
            type="button"
          >
            <FaEye className="w-5 h-5" />
          </button>
        )}
        <a
          href={file.file || file.url || "#"}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <FaDownload className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export default FileItem;
