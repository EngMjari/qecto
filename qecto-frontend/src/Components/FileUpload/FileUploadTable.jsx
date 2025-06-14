import React, { useRef } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

// آیکون پیش‌نمایش نوع فایل
function FileTypePreview({ file }) {
  const name = file.name.toLowerCase();
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return (
      <svg
        width="24"
        height="24"
        fill="#f97316"
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
        fill="#f97316"
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
        fill="#f97316"
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
function FileUploadTable({ files = [], onFileChange }) {
  const fileInputRef = useRef();
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const filteredFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `فایل "${file.name}" بیش از ۱۰ مگابایت است و نمی‌تواند اضافه شود.`
        );
        return false;
      }
      return true;
    });

    const totalFiles = files.length + filteredFiles.length;
    if (totalFiles > MAX_FILES) {
      toast.error(`حداکثر ${MAX_FILES} فایل می‌توانید انتخاب کنید.`);
      const allowedCount = MAX_FILES - files.length;
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
    <div className="animate-fade-in">
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".pdf,image/*,.zip,.rar,.7z"
        aria-label="انتخاب فایل‌ها"
      />

      <Row className="mb-3">
        <Col xs={12}>
          <p className="text-muted text-sm">
            حداکثر {MAX_FILES} فایل، هر کدام تا {MAX_FILE_SIZE / (1024 * 1024)}{" "}
            مگابایت (فرمت‌های مجاز: PDF، تصویر، ZIP، RAR، 7Z)
          </p>
        </Col>
        <Col xs={6}>
          <Button
            className="!bg-[#ff6f00] w-full !text-white rounded-lg py-2 px-4 text-base hover:!bg-[#e65100] transition-all duration-300"
            onClick={() => fileInputRef.current.click()}
            aria-label="انتخاب یا ویرایش فایل‌ها"
          >
            انتخاب/ویرایش فایل‌ها
          </Button>
        </Col>
        {files.length > 0 && (
          <Col xs={6}>
            <Button
              className="!border-2 !border-[#ff6f00] w-full !text-[#ff6f00] rounded-lg py-2 px-4 text-base hover:!bg-[#f97316] hover:!text-white transition-all duration-300 !bg-transparent"
              onClick={() => onFileChange([])}
              aria-label="حذف همه فایل‌ها"
            >
              حذف همه فایل‌ها
            </Button>
          </Col>
        )}
      </Row>

      {files.length === 0 ? (
        <p className="text-muted text-center">هیچ فایلی انتخاب نشده است.</p>
      ) : (
        <table className="w-full border-collapse text-center text-sm">
          <thead className="bg-orange-100 text-orange-600">
            <tr>
              <th scope="col" className="p-2 border border-orange-300">
                عنوان
              </th>
              <th scope="col" className="p-2 border border-orange-300 w-[50px]">
                نوع
              </th>
              <th scope="col" className="p-2 border border-orange-300 w-[80px]">
                حجم
              </th>
              <th scope="col" className="p-2 border border-orange-300 w-[80px]">
                حذف
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map(({ file, title }, index) => (
              <tr
                key={file.name + index}
                className="hover:bg-orange-50 transition-all duration-200"
              >
                <td className="p-2 border border-orange-300">
                  <Form.Control
                    type="text"
                    placeholder="عنوان فایل"
                    value={title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    className="border-2 border-gray-300 rounded-lg p-1 text-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                    aria-label={`عنوان فایل ${file.name}`}
                  />
                </td>
                <td className="p-2 border border-orange-300">
                  <FileTypePreview file={file} />
                </td>
                <td className="p-2 border border-orange-300">
                  {formatFileSize(file.size)}
                </td>
                <td className="p-2 border border-orange-300">
                  <Button
                    className="!border-2 !border-[#ff6f00] w-full !text-[#ff6f00] rounded-lg py-1 px-2 text-sm hover:!bg-[#f97316] hover:!text-white transition-all duration-300 !bg-transparent"
                    onClick={() => handleRemoveFile(index)}
                    aria-label={`حذف فایل ${file.name}`}
                  >
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FileUploadTable;
