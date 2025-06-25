import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import { AuthContext } from "Contexts/AuthContext";
import { fetchRequestDetail } from "../../api";

const getRequestTypeName = (type) => {
  const types = {
    survey: "نقشه‌برداری",
    supervision: "نظارت",
    expert: "کارشناسی",
    execution: "اجرا",
    registration: "ثبت",
  };
  return types[type] || "نامشخص";
};

const getRequestStatusName = (status) => {
  const statuses = {
    pending: "در حال بررسی",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    rejected: "رد شده",
    incomplete: "ناقص",
  };
  return statuses[status] || "نامشخص";
};

const getStatusBadge = (status) => {
  const badges = {
    pending: "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200",
    completed: "bg-green-100 text-green-800 ring-1 ring-inset ring-green-200",
    rejected: "bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-200",
    incomplete: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200",
  };
  return (
    badges[status] ||
    "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200"
  );
};

const getPropertyTypeName = (type) => {
  const types = {
    field: "زمین",
    building: "ساختمان",
    other: "سایر",
  };
  return types[type] || "نامشخص";
};

function RequestCard({
  request,
  isAdmin,
  setReferralType,
  setReferralData,
  setIsReferralModalOpen,
  showToast,
}) {
  const navigate = useNavigate();
  const { userProfile } = useContext(AuthContext);
  const {
    id,
    request_type,
    status,
    created_at,
    assigned_admin,
    specific_fields = {},
    tracking_code,
  } = request;

  // دیباگ برای بررسی user و assigned_admin
  console.log("RequestCard - User:", userProfile);
  console.log("RequestCard - Assigned Admin:", assigned_admin);

  // بررسی دسترسی: کاربر غیر ادمین یا ادمین با assigned_admin منطبق
  const hasAccess =
    !isAdmin || (userProfile?.id && assigned_admin?.id === userProfile.id);

  const handleCardClick = async (e) => {
    e.stopPropagation();
    if (!hasAccess) {
      showToast("به این درخواست دسترسی ندارید.", "error");
      return;
    }
    try {
      const res = await fetchRequestDetail(request.id);
      navigate(`/requests/${request.id}`, { state: { request: res } });
    } catch (err) {
      console.error("Error fetching request detail:", err);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-gray-50 rounded-xl shadow-sm p-3 sm:p-4 flex flex-col border border-gray-100 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadge(
              status
            )}`}
          >
            {getRequestStatusName(status)}
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full ring-1 ring-inset ring-gray-200">
            {getRequestTypeName(request_type)}
          </span>
        </div>
        {isAdmin && hasAccess && assigned_admin?.id === userProfile?.id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReferralType("request");
              setReferralData(request);
              setIsReferralModalOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            <FaUserPlus className="w-4 h-4" />
            ارجاع درخواست
          </button>
        )}
      </div>
      <div className="space-y-1 mb-3">
        <p className="text-xs text-gray-400">
          تاریخ ثبت: {new Date(created_at).toLocaleDateString("fa-IR")}
        </p>
        {tracking_code && (
          <p className="text-xs text-gray-400">کد رهگیری: {tracking_code}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-700">
        {specific_fields.property_type && (
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-gray-800">نوع ملک:</strong>
            <span>{getPropertyTypeName(specific_fields.property_type)}</span>
          </div>
        )}
        {specific_fields.area && (
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-gray-800">مساحت:</strong>
            <span>{specific_fields.area.toLocaleString("fa-IR")} متر مربع</span>
          </div>
        )}
        {(request_type === "survey" ||
          request_type === "expert" ||
          request_type === "registration") &&
          specific_fields.main_parcel_number && (
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-gray-800">
                پلاک ثبتی:
              </strong>
              <span>
                {specific_fields.main_parcel_number} /{" "}
                {specific_fields.sub_parcel_number || "بدون پلاک فرعی"}
              </span>
            </div>
          )}
        {specific_fields.building_area && (
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-gray-800">
              مساحت ساختمان:
            </strong>
            <span>
              {specific_fields.building_area.toLocaleString("fa-IR")} متر مربع
            </span>
          </div>
        )}
        {specific_fields.description && (
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-gray-800">توضیحات:</strong>
            <span className="line-clamp-1">{specific_fields.description}</span>
          </div>
        )}
        {specific_fields.supervision_type && (
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-gray-800">نوع نظارت:</strong>
            <span>{specific_fields.supervision_type_display}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <strong className="font-semibold text-gray-800">وضعیت ارجاع:</strong>
          <span className="flex items-center gap-1">
            {assigned_admin ? (
              <>
                <FaUserCheck className="text-green-600 w-4 h-4" />
                {assigned_admin.full_name || "نامشخص"}
              </>
            ) : (
              "ارجاع نشده"
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default RequestCard;
