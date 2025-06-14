import React from "react";
import {
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileArchive,
} from "react-icons/fa";
import { SiAutodesk } from "react-icons/si";

export default function getFileIcon(file) {
  const ext = (file.file_extension || "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return <FaFileImage className="w-6 h-6 text-pink-500 ml-4" />;
  if (ext === "pdf") return <FaFilePdf className="w-6 h-6 text-red-500 ml-4" />;
  if (["dwg", "dxf"].includes(ext))
    return <SiAutodesk className="w-6 h-6 text-green-700 ml-4" />;
  if (["rar", "zip"].includes(ext))
    return <FaFileArchive className="w-6 h-6 text-yellow-500 ml-4" />;
  return <FaFileAlt className="w-6 h-6 text-blue-500 ml-4" />;
}
