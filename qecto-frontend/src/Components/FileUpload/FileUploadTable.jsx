import React, { useRef } from "react";

// آیکون پیش‌نمایش نوع فایل
function FileTypePreview({ file }) {
  const name = file.name.toLowerCase();
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return (
      <svg
        width="24"
        height="24"
        fill="#FF5722"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ verticalAlign: "middle" }}
      >
        <path d="M6 2h12v20H6zM9 4h6v2H9zM9 8h6v2H9zM9 12h6v2H9zM9 16h6v2H9z" />
      </svg>
    );
  }

  if (type.startsWith("image/")) {
    return (
      <svg
        width="24"
        height="24"
        fill="#4CAF50"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ verticalAlign: "middle" }}
      >
        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
        <circle cx="8" cy="10" r="2" fill="white" />
        <path d="M3 20l6-6 4 4 5-7 4 5v2H3z" fill="white" />
      </svg>
    );
  }

  if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z")) {
    return (
      <svg
        width="24"
        height="24"
        fill="#FF9800"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ verticalAlign: "middle" }}
      >
        <path d="M6 2h12v20H6zM9 4h6v2H9zM9 8h6v2H9zM9 12h6v2H9zM9 16h6v2H9z" />
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      fill="#444"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: "middle" }}
    >
      <path d="M6 2h12v20H6z" />
    </svg>
  );
}

// قالب‌بندی سایز فایل
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// جدول بارگذاری فایل‌ها
function FileUploadTable({ attachments = [], onFileChange }) {
  const fileInputRef = useRef();
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const filteredFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `فایل "${file.name}" بیش از ۱۰ مگابایت است و نمی‌تواند اضافه شود.`
        );
        return false;
      }
      return true;
    });

    const totalFiles = attachments.length + filteredFiles.length;
    if (totalFiles > MAX_FILES) {
      alert("حداکثر ۱۰ فایل می‌توانید انتخاب کنید.");
      const allowedCount = MAX_FILES - attachments.length;
      if (allowedCount <= 0) {
        e.target.value = null;
        return;
      }
      filteredFiles.splice(0, allowedCount);
    }

    const newAttachments = filteredFiles.map((file) => ({
      file,
      title: "",
    }));

    onFileChange((prev) => [...prev, ...newAttachments]);
    e.target.value = null; // reset input for duplicate file selection
  };

  const handleRemoveFile = (index) => {
    onFileChange((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTitleChange = (index, newTitle) => {
    onFileChange((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], title: newTitle };
      return updated;
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".pdf,image/*,.zip,.rar,.7z"
      />

      <div className="mb-2 d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => fileInputRef.current.click()}
        >
          انتخاب/ویرایش فایل‌ها
        </button>
        {attachments.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => onFileChange([])}
          >
            حذف همه فایل‌ها
          </button>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-muted">هیچ فایلی انتخاب نشده است.</p>
      ) : (
        <table className="table table-bordered table-striped table-sm text-center align-middle w-100">
          <thead className="table-info">
            <tr>
              <th style={{ minWidth: "100px" }}>عنوان</th>
              <th style={{ width: "50px" }}>نوع</th>
              <th style={{ width: "80px" }}>حجم</th>
              <th style={{ width: "80px" }}>حذف</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map(({ file, title }, index) => (
              <tr key={file.name + index}>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="عنوان فایل"
                    value={title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <FileTypePreview file={file} />
                </td>
                <td>{formatFileSize(file.size)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={() => handleRemoveFile(index)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileUploadTable;
