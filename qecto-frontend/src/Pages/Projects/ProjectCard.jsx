import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaUserPlus } from "react-icons/fa";
import { AuthContext } from "Contexts/AuthContext";
import RequestCard from "./RequestCard";
import MiniMap from "./MiniMap";

function ProjectCard({
  project,
  openProjectId,
  setOpenProjectId,
  isAdmin,
  setReferralType,
  setReferralData,
  setIsReferralModalOpen,
  showToast,
}) {
  const { userProfile } = useContext(AuthContext);
  const { id, title, created_at, owner, requests = [] } = project;

  const lastRequestWithLocation = requests
    .slice()
    .reverse()
    .find(
      (r) =>
        r.specific_fields?.location_lat &&
        r.specific_fields?.location_lng &&
        !isNaN(Number(r.specific_fields.location_lat)) &&
        !isNaN(Number(r.specific_fields.location_lng))
    );

  const lat = lastRequestWithLocation
    ? Number(lastRequestWithLocation.specific_fields.location_lat)
    : null;
  const lng = lastRequestWithLocation
    ? Number(lastRequestWithLocation.specific_fields.location_lng)
    : null;

  // بررسی اینکه آیا همه درخواست‌ها به ادمین فعلی ارجاع شده‌اند
  const canReferProject =
    isAdmin &&
    userProfile?.id &&
    requests.length > 0 &&
    requests.every((req) => {
      return req.assigned_admin?.id === userProfile.id;
    });

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
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
    >
      <div
        className="flex flex-col cursor-pointer"
        onClick={() => setOpenProjectId(openProjectId === id ? null : id)}
      >
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full ring-1 ring-inset ring-gray-200">
                تعداد درخواست‌ها: {requests.length}
              </span>
              {isAdmin && canReferProject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReferralType("project");
                    setReferralData(project);
                    setIsReferralModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  <FaUserPlus className="w-4 h-4" />
                  ارجاع پروژه
                </button>
              )}
            </div>
            <motion.div
              animate={{ rotate: openProjectId === id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown className="text-gray-600" />
            </motion.div>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2 line-clamp-2">
            {title || "بدون عنوان"}
          </h3>
          <div className="space-y-1 mb-3">
            <p className="text-xs text-gray-400">
              تاریخ ثبت: {new Date(created_at).toLocaleDateString("fa-IR")}
            </p>
            {isAdmin && owner && (
              <p className="text-xs text-gray-400">
                مالک: {owner.full_name || "نامشخص"}
              </p>
            )}
          </div>
        </div>
        <div className="w-full h-48">
          <MiniMap className="rounded-top-0" lat={lat} lng={lng} />
        </div>
      </div>
      <AnimatePresence>
        {openProjectId === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 sm:p-4"
          >
            <div className="grid grid-cols-1 gap-3">
              {requests.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  درخواستی برای این پروژه ثبت نشده است.
                </div>
              ) : (
                requests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    isAdmin={isAdmin}
                    setReferralType={setReferralType}
                    setReferralData={setReferralData}
                    setIsReferralModalOpen={setIsReferralModalOpen}
                    showToast={showToast}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProjectCard;
