import React from "react";
import { FaTimes } from "react-icons/fa";
import getFileIcon from "./getFileIcon";

function FileItemForSelectedFiles({
  file,
  index,
  onRemove,
  title,
  onTitleChange,
}) {
  const ext = file.name.split(".").pop().toLowerCase();
  const isImage = file.type?.startsWith("image/");

  return (
    <div
      className="flex flex-col items-start bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm relative animate-fadeInUp"
      style={{ minWidth: 160, maxWidth: 220 }}
    >
      <div className="flex items-center w-full relative">
        <div className="ml-2">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-8 h-8 object-cover rounded border"
            />
          ) : (
            getFileIcon({ file_extension: ext })
          )}
        </div>

        <span
          className="truncate text-xs font-medium text-gray-700"
          title={file.name}
        >
          {file.name}
        </span>

        <button
          type="button"
          className="absolute -top-0.5 -left-0.5 bg-white border border-gray-300 rounded-full p-1 text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-200 ease-in-out"
          onClick={() => onRemove(index)}
          title="حذف فایل"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>

      <input
        type="text"
        className="mt-2 w-full border rounded px-2 py-1 text-xs"
        placeholder="عنوان فایل (اختیاری)"
        value={title || ""}
        onChange={(e) => onTitleChange(index, e.target.value)}
        maxLength={100}
      />
    </div>
  );
}

export default FileItemForSelectedFiles;
