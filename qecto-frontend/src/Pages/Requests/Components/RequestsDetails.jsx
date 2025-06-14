import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaShieldAlt,
  FaFileAlt,
  FaExpand,
  FaMapMarkerAlt,
  FaRegBuilding,
} from "react-icons/fa";
import Card from "./Card";
import CardHeader from "./CardHeader";

function RequestDetails({ request }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const statusMap = {
    pending: "در انتظار بررسی",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    rejected: "رد شده",
    incomplete: "ناقص",
  };

  const propertyTypeMap = {
    field: "زمین",
    building: "ساختمان",
    other: "سایر",
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    incomplete: "bg-gray-100 text-gray-800",
  };

  if (error) {
    return (
      <Card>
        <CardHeader>خطا</CardHeader>
        <div className="px-5 py-3 text-red-600">{error}</div>
      </Card>
    );
  }

  if (!request || loading) {
    setLoading(true);
    return (
      <Card>
        <CardHeader>در حال بارگذاری...</CardHeader>
        <div className="px-5 py-3">لطفاً صبر کنید</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>{request?.title || "بدون عنوان"}</CardHeader>
      <div className="px-5 py-3">
        <div className="flex flex-col gap-1">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              statusColor[request.status] || "bg-gray-100 text-gray-800"
            } whitespace-nowrap w-fit mt-1`}
            title={statusMap[request.status] || "نامشخص"}
          >
            {statusMap[request.status] || "نامشخص"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ایجاد شده در: {request.createAt ? request.createAt : "—"}
        </p>
        <div className="mt-6 space-y-4 text-xs">
          {request.assignedAdmin && (
            <div className="flex items-center">
              <FaShieldAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>ارجاع به:</strong>
              <span className="mr-2">{request.assignedAdmin.full_name}</span>
            </div>
          )}
          <div className="flex items-center">
            <FaFileAlt className="w-5 h-5 ml-3 text-gray-400" />
            <strong>نوع ملک:</strong>
            <span className="mr-2">
              {propertyTypeMap[request.property_type] || "—"}
            </span>
          </div>
          <div className="flex items-center">
            <FaExpand className="w-5 h-5 ml-3 text-gray-400" />
            <strong>مساحت:</strong>
            <span className="mr-2">
              {request.area ? `${request.area} متر مربع` : "—"}
            </span>
          </div>
          <div className="flex items-center">
            <FaRegBuilding className="w-5 h-5 ml-3 text-gray-400" />
            <strong>مساحت بنا:</strong>
            <span className="mr-2">
              {request.building_area
                ? `${request.building_area} متر مربع`
                : "—"}
            </span>
          </div>
          {request.main_parcel_number && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>پلاک ثبتی اصلی:</strong>
              <span className="mr-2">{request.main_parcel_number}</span>
            </div>
          )}
          {request.sub_parcel_number && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>پلاک ثبتی فرعی:</strong>
              <span className="mr-2">{request.sub_parcel_number}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default RequestDetails;
