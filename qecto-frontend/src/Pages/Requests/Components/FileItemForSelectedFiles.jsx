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
      className="flex flex-col items-start bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 shadow-sm relative hover:shadow-md transition-shadow duration-200"
      style={{ minWidth: 180, maxWidth: 240 }}
    >
      <div className="flex items-center w-full relative">
        <div className="ml-3">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-10 h-10 object-cover rounded border border-gray-200"
            />
          ) : (
            getFileIcon({ file_extension: ext })
          )}
        </div>
        <span
          className="truncate text-sm font-medium text-gray-800 flex-grow"
          title={file.name}
        >
          {file.name}
        </span>
        <button
          type="button"
          className="absolute -top-1 -left-1 bg-white border border-gray-300 rounded-full p-1.5 text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-200"
          onClick={() => onRemove(index)}
          title="حذف فایل"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
      <input
        type="text"
        className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
        placeholder="عنوان فایل (اختیاری)"
        value={title || ""}
        onChange={(e) => onTitleChange(index, e.target.value)}
        maxLength={100}
      />
    </div>
  );
}

export default FileItemForSelectedFiles;
