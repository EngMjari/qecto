import React, { useState, useEffect } from "react";
import { fetchSurveyAttachmentPreview } from "../../api/projectsApi";

function getFileUrl(file) {
  if (!file.file) return "#";
  if (file.file.startsWith("http")) return file.file;
  return file.file;
}

function PreviewModal({ open, file, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !file) return;
    const ext = (file.file_extension || "").toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      setPreviewUrl(getFileUrl(file));
      setError("");
      setLoading(false);
      return;
    }

    if (["pdf", "xls", "xlsx", "dwg", "dxf"].includes(ext)) {
      setLoading(true);
      setError("");
      fetchSurveyAttachmentPreview(file.id)
        .then((res) => {
          const url = URL.createObjectURL(res.data);
          setPreviewUrl(url);
        })
        .catch(() => {
          setError("پیش‌نمایش این فایل ممکن نیست.");
        })
        .finally(() => setLoading(false));
      return;
    }

    setPreviewUrl(null);
    setError("پیش‌نمایش این فرمت پشتیبانی نمی‌شود.");
    setLoading(false);
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
            alt={file.custom_name || file.title}
            className="max-h-[70vh] mx-auto rounded"
            style={{ display: "block" }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default PreviewModal;
