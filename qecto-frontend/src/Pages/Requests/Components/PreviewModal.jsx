import React, { useState, useEffect } from "react";
import { getFilePreview } from "../../../api/attachmentApi";

function getFileUrl(file) {
  if (!file.file_url) {
    console.warn("file_url is missing:", file);
    return "#";
  }
  if (file.file_url.startsWith("http")) {
    return file.file_url;
  }
  const baseUrl = process.env.REACT_APP_API_URL || "http://192.168.1.3:8000";
  return `${baseUrl}${file.file_url.startsWith("/") ? "" : "/"}${
    file.file_url
  }`;
}

function PreviewModal({ open, file, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !file) return;

    console.log("Previewing file:", file); // لاگ برای دیباگ

    const ext = (file.file_format || file.file_extension || "").toLowerCase();

    // برای تصاویر مستقیم
    if (["jpg", "jpeg", "png"].includes(ext)) {
      const url = getFileUrl(file);
      setPreviewUrl(url);
      setError("");
      setLoading(false);
      return;
    }

    // برای PDF
    if (ext === "pdf") {
      setLoading(true);
      setError("");
      getFilePreview(file.id)
        .then((url) => {
          setPreviewUrl(url);
        })
        .catch((err) => {
          setError(err.error || "خطا در بارگذاری پیش‌نمایش فایل PDF.");
          console.error("Preview error:", err);
        })
        .finally(() => setLoading(false));
      return;
    }

    setPreviewUrl(null);
    setError("پیش‌نمایش این فرمت پشتیبانی نمی‌شود.");
    setLoading(false);

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [open, file]);

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            در حال دریافت پیش‌نمایش...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt={file.custom_name || file.title || "پیش‌نمایش"}
            className="max-h-[70vh] mx-auto rounded"
            style={{ display: "block" }}
            onError={() => setError("نمی‌توان تصویر را بارگذاری کرد.")}
          />
        ) : (
          <div className="text-center text-gray-500 py-10">
            هیچ پیش‌نمایشی موجود نیست.
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewModal;
