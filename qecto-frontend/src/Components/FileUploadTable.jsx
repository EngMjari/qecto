import React, { useRef } from "react";

// کامپوننت نمایش آیکون نوع فایل
function FileTypePreview({ file }) {
  const name = file.name.toLowerCase();
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    // آیکون pdf
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
    // آیکون تصویر (بدون پیش نمایش)
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

  if (
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    name.endsWith(".7z")
  ) {
    // آیکون فایل فشرده
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

  // آیکون پیش‌فرض فایل
  return (
    <svg
      width="24"
      height="24"
      fill="gray"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: "middle" }}
    >
      <path d="M6 2h12v20H6z" />
    </svg>
  );
}

// تابع برای فرمت حجم فایل
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function FileUploadTable({ files, setFiles }) {
  const fileInputRef = useRef();

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 مگابایت

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // فیلتر کردن فایل‌هایی که حجمشون بیشتر از ۱۰ مگ هست
    const filteredFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `فایل "${file.name}" بیش از ۱۰ مگابایت است و نمی‌تواند اضافه شود.`
        );
        return false;
      }
      return true;
    });

    // محدود کردن تعداد کل فایل‌ها به ۱۰
    const totalFiles = (files?.length || 0) + filteredFiles.length;
    if (totalFiles > MAX_FILES) {
      alert("حداکثر ۱۰ فایل می‌توانید انتخاب کنید.");
      const allowedCount = MAX_FILES - (files?.length || 0);
      if (allowedCount <= 0) {
        e.target.value = null;
        return;
      }
      filteredFiles.splice(allowedCount);
    }

    const newFiles = filteredFiles.map((file) => ({
      file,
      title: "",
      id: Math.random().toString(36).substr(2, 9),
      type: file.type || "نامشخص",
    }));

    setFiles((prev) => [...(Array.isArray(prev) ? prev : []), ...newFiles]);
    e.target.value = null;
  };

  const handleTitleChange = (id, newTitle) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title: newTitle } : f))
    );
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
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
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => fileInputRef.current.click()}
        >
          انتخاب/ویرایش فایل‌ها
        </button>

        {Array.isArray(files) && files.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-danger ms-2"
            onClick={() => setFiles([])}
          >
            حذف همه فایل‌ها
          </button>
        )}
      </div>

      {(!Array.isArray(files) || files.length === 0) ? (
        <p>هیچ فایلی انتخاب نشده است.</p>
      ) : (
        <table
          className="table table-striped table-bordered table-light border-danger"
          style={{ verticalAlign: "middle" }}
        >
          <thead className="table-info">
            <tr className="text-center align-middle">
              <th>نام فایل</th>
              <th style={{ width: 40 }}>نوع فایل</th>
              <th style={{ width: 100 }}>حجم فایل</th>
              <th>عنوان فایل</th>
              <th style={{ width: 100 }}>حذف</th>
            </tr>
          </thead>
          <tbody>
            {files.map(({ id, file, title }) => (
              <tr key={id} className="align-middle">
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
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <FileTypePreview file={file} />
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatFileSize(file.size)}
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="عنوان فایل"
                    style={{ height: "30px", padding: "3px 8px" }}
                    value={title}
                    onChange={(e) => handleTitleChange(id, e.target.value)}
                  />
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={() => handleRemoveFile(id)}
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
