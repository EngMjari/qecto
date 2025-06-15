import React from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import { HiOutlineDocument, HiOutlinePhotograph } from "react-icons/hi";
import getFileIcon from "./getFileIcon";
import { FaFilePdf } from "react-icons/fa";

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

function FileItem({
  file,
  ticketTitle,
  onPreview,
  isAdmin,
  senderLabel,
  session,
}) {
  const ext = (file.file_format || "").toLowerCase();
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
    <div
      className="w-full my-3 cursor-pointer group"
      tabIndex={0}
      aria-label={`فایل ${
        file.custom_name ||
        file.title ||
        (file.file ? file.file.split("/").pop() : "")
      }`}
    >
      <div
        className="flex items-center p-4 bg-white border border-gray-300 rounded-lg shadow-sm 
                      hover:shadow-lg hover:border-blue-400 transition-shadow duration-300 ease-in-out
                      ring-0 focus-within:ring-2 focus-within:ring-blue-400 focus-within:outline-none"
      >
        {/* آیکون فایل */}
        <div className="flex-shrink-0 text-blue-500 text-4xl mr-4">
          {getFileIcon(file) ||
            (ext === "pdf" ? (
              <FaFilePdf />
            ) : ext.match(/(jpg|jpeg|png|gif|bmp|webp)/) ? (
              <HiOutlinePhotograph />
            ) : (
              <HiOutlineDocument />
            ))}
        </div>

        {/* اطلاعات فایل */}
        <div className="flex-grow flex flex-col">
          <p
            className="font-semibold text-gray-900 text-base truncate"
            title={file.custom_name || file.title}
          >
            {file.custom_name ||
              file.title ||
              (file.file ? file.file.split("/").pop() : "")}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1 text-xs text-gray-500 font-mono">
            <span className="uppercase">{file.file_extension || ""}</span>
            <span>{formatFileSize(file.readable_file_size) || ""}</span>
            <span>
              {file.uploaded_at
                ? new Date(file.uploaded_at).toLocaleDateString("fa-IR")
                : ""}
            </span>
            {senderLabel && (
              <span className="italic whitespace-nowrap text-gray-600">
                ارسال شده توسط:{" "}
                <span className="font-semibold">{senderLabel}</span>
              </span>
            )}
          </div>

          {session && (
            <span
              className="mt-2 text-sm text-blue-700 font-semibold border-t border-blue-200 pt-1 truncate"
              title={`عنوان تیکت: ${session}`}
            >
              عنوان تیکت: «{session}»
            </span>
          )}

          {ticketTitle && (
            <span className="mt-1 text-xs text-gray-400 truncate">
              فایل مربوط به تیکت «{ticketTitle}»
              {isAdmin && <span className="text-blue-600 mr-2">(کارشناس)</span>}
            </span>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="flex flex-col items-center justify-center gap-2 mr-4">
          {canPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors duration-200"
              title="پیش‌نمایش"
              type="button"
              aria-label="پیش‌نمایش فایل"
            >
              <FaEye className="w-5 h-5" />
            </button>
          )}

          <a
            href={file.file || file.url || "#"}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            title="دانلود فایل"
            aria-label="دانلود فایل"
            onClick={(e) => e.stopPropagation()}
          >
            <FaDownload className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default FileItem;
