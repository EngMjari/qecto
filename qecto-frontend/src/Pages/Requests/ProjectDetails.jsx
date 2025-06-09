import React from "react";
import {
  FaShieldAlt,
  FaFileAlt,
  FaExpand,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Card from "./Card";
import CardHeader from "./CardHeader";
function ProjectDetails({ project }) {
  const statusMap = {
    pending: "در انتظار بررسی",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    rejected: "رد شده",
    incomplete: "ناقص",
  };
  const propertyTypeMap = {
    field: "زمین",
    Building: "ساختمان",
    other: "سایر",
  };
  const statusColor =
    {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      incomplete: "bg-gray-100 text-gray-800",
    }[project.status] || "bg-gray-100 text-gray-800";
  const isAssigned = !!project.assigned_admin && !!project.assigned_admin.name;

  return (
    <Card>
      <CardHeader>{project.project.title || "بدون عنوان"}</CardHeader>
      <div className="px-5 py-3">
        <div className="flex flex-col gap-1">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} whitespace-nowrap w-fit mt-1`}
            title={statusMap[project.status] || "نامشخص"}
          >
            {statusMap[project.status] || "نامشخص"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ایجاد شده در:{" "}
          {project.created_at
            ? new Date(project.created_at).toLocaleDateString("fa-IR")
            : "—"}
        </p>
        <div className="mt-6 space-y-4 text-xs">
          {isAssigned && (
            <div className="flex items-center">
              <FaShieldAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>ارجاع به:</strong>
              <span className="mr-2">{project.assigned_admin.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <FaFileAlt className="w-5 h-5 ml-3 text-gray-400" />
            <strong>نوع ملک:</strong>
            <span className="mr-2">
              {propertyTypeMap[project.property_type] || "—"}
            </span>
          </div>
          <div className="flex items-center">
            <FaExpand className="w-5 h-5 ml-3 text-gray-400" />
            <strong>مساحت:</strong>
            <span className="mr-2">
              {project.area ? `${project.area} متر مربع` : "—"}
            </span>
          </div>
          {project.main_parcel_number && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>پلاک ثبتی اصلی:</strong>
              <span className="mr-2">{project.main_parcel_number}</span>
            </div>
          )}
          {project.sub_parcel_number && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>پلاک ثبتی فرعی:</strong>
              <span className="mr-2">{project.sub_parcel_number}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ProjectDetails;
