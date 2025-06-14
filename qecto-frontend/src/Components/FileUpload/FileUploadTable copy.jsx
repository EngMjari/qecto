import React, { useRef } from "react";

// کامپوننت آیکون فایل (بدون تغییر)
function FileTypePreview({ file }) {
  const name = file.name.toLowerCase();
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return (
      <svg width="24" height="24" fill="#FF5722" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
        <path d="M6 2h12v20H6zM9 4h6v2H9zM9 8h6v2H9zM9 12h6v2H9zM9 16h6v2H9z" />
      </svg>
    );
  }
  if (type.startsWith("image/")) {
    return (
      <svg width="24" height="24" fill="#4CAF50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
        <circle cx="8" cy="10" r="2" fill="white" />
        <path d="M3 20l6-6 4 4 5-7 4 5v2H3z" fill="white" />
      </svg>
    );
  }
  if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z")) {
    return (
      <svg width="24" height="24" fill="#FF9800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
        <path d="M6 2h12v20H6zM9 4h6v2H9zM9 8h6v2H9zM9 12h6v2H9zM9 16h6v2H9z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" fill="gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
      <path d="M6 2h12v20H6z" />
    </svg>
  );
}

// فرمت حجم فایل (بدون تغییر)
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function FileUploadTable({ attachments, onFileChange }) {
  const fileInputRef = useRef();

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 مگابایت

  // وقتی فایل‌ها انتخاب می‌شوند
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // فیلتر حجم فایل‌ها
    const filteredFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`فایل "${file.name}" بیش از ۱۰ مگابایت است و نمی‌تواند اضافه شود.`);
        return false;
      }
      return true;
    });

    // بررسی تعداد کل فایل‌ها
    const totalFiles = (attachments?.length || 0) + filteredFiles.length;
    if (totalFiles > MAX_FILES) {
      alert("حداکثر ۱۰ فایل می‌توانید انتخاب کنید.");
      const allowedCount = MAX_FILES - (attachments?.length || 0);
      if (allowedCount <= 0) {
        e.target.value = null;
        return;
      }
      filteredFiles.splice(allowedCount);
    }

    // افزودن فایل‌ها به صورت آبجکت با عنوان خالی پیش‌فرض
    const newAttachments = filteredFiles.map(file => ({
      file,
      title: ""  // یا می‌توانید مقدار پیش‌فرض مثلا file.name هم قرار دهید
    }));

    onFileChange(prev => [...(Array.isArray(prev) ? prev : []), ...newAttachments]);

    e.target.value = null; // پاک کردن ورودی فایل
  };

  // حذف یک فایل از لیست
  const handleRemoveFile = (index) => {
    onFileChange(prev => prev.filter((_, i) => i !== index));
  };

  // تغییر عنوان فایل
  const handleTitleChange = (index, newTitle) => {
    onFileChange(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], title: newTitle };
      return copy;
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
      <div className="mb-2">
        <button type="button" className="btn btn-sm btn-primary" onClick={() => fileInputRef.current.click()}>
          انتخاب/ویرایش فایل‌ها
        </button>

        {attachments.length > 0 && (
          <button type="button" className="btn btn-sm btn-danger ms-2" onClick={() => onFileChange([])}>
            حذف همه فایل‌ها
          </button>
        )}
      </div>

      {attachments.length === 0 ? (
        <p>هیچ فایلی انتخاب نشده است.</p>
      ) : (
        <table className="table table-striped table-bordered table-light border-danger" style={{ verticalAlign: "middle" }}>
          <thead className="table-info">
            <tr className="text-center align-middle">
              <th style={{ maxWidth: "250px" }}>عنوان فایل</th>
              <th style={{ maxWidth: "250px" }}>نام فایل</th>
              <th style={{ width: 40 }}>نوع فایل</th>
              <th style={{ width: 100 }}>حجم فایل</th>
              <th style={{ width: 100 }}>حذف</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map(({ file, title }, index) => (
              <tr key={file.name + index} className="align-middle">
                <td style={{ verticalAlign: "middle", maxWidth: "250px" }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="عنوان فایل را وارد کنید"
                    value={title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                  />
                </td>
                <td
                  title={file.name}
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "250px",
                    verticalAlign: "middle",
                  }}
                >
                  {file.name}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <FileTypePreview file={file} />
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                  {formatFileSize(file.size)}
                </td>
                <td style={{ verticalAlign: "middle" }}>
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
