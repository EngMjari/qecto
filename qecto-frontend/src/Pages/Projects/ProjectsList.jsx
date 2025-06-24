import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChartPie,
  FaUserCheck,
  FaSpinner,
} from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";
import { fetchProjects, fetchRequestDetail } from "../../api";
import LoadingScreen from "Pages/LoadingScreen/LoadingScreen";
import { AuthContext } from "Contexts/AuthContext";
// تابع برای دریافت نام نوع درخواست
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

// تابع برای دریافت نام وضعیت درخواست
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

// تابع برای دریافت کلاس‌های استایل وضعیت درخواست
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

// تابع برای دریافت نام نوع ملک
const getPropertyTypeName = (type) => {
  const types = {
    field: "زمین",
    building: "ساختمان",
    other: "سایر",
  };
  return types[type] || "نامشخص";
};

function ProjectsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);

  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get("search") || "",
      request_type: params.get("request_type") || "all",
      request_status: params.get("request_status") || "all",
      start_date: params.get("start_date") || "",
      end_date: params.get("end_date") || "",
      main_parcel_number: params.get("main_parcel_number") || "",
      sub_parcel_number: params.get("sub_parcel_number") || "",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total_projects: 0,
    status_counts: {},
    request_type_counts: {},
  });
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [openProjectId, setOpenProjectId] = useState(null);

  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum };
      if (filters.search) params.title = filters.search;
      if (filters.request_type !== "all")
        params.request_type = filters.request_type;
      if (filters.request_status !== "all")
        params.request_status = filters.request_status;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.main_parcel_number)
        params.main_parcel_number = filters.main_parcel_number;
      if (filters.sub_parcel_number)
        params.sub_parcel_number = filters.sub_parcel_number;

      const res = await fetchProjects(params);
      setProjects(res.results || []);
      setStats(res.stats || {});
      setTotalCount(res.count || 0);
      setNextPage(res.next);
      setPreviousPage(res.previous);
      console.log("fetchproject : ", res.results);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
      setStats({
        total_projects: 0,
        status_counts: {},
        request_type_counts: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.request_type !== "all")
      params.set("request_type", filters.request_type);
    if (filters.request_status !== "all")
      params.set("request_status", filters.request_status);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    if (filters.main_parcel_number)
      params.set("main_parcel_number", filters.main_parcel_number);
    if (filters.sub_parcel_number)
      params.set("sub_parcel_number", filters.sub_parcel_number);
    navigate({ search: params.toString() });
  };

  useEffect(() => {
    fetchData(page);
    updateUrlWithFilters();
  }, [filters, page]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(totalCount / 10)) {
      setPage(newPage);
    }
  };

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } },
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="bg-gray-50 min-h-screen font-vazir" dir="rtl">
      <div className="flex">
        <div className="w-64 flex-shrink-0 hidden lg:block border-l border-gray-200 bg-white shadow-sm">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isMobile={false}
          />
        </div>
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed inset-0 z-1000"
            >
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsFilterOpen(false)}
              ></div>
              <div className="relative w-4/5 max-w-xs h-full bg-white ml-auto">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  setIsOpen={setIsFilterOpen}
                  isMobile={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <main className="flex-1 p-3 sm:p-4 lg:p-6 page-content">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  لیست پروژه‌ها
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  تعداد کل: {totalCount}
                </p>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors"
              >
                <FaFilter className="text-gray-600" />
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setIsStatsOpen(!isStatsOpen)}
                className="w-full flex justify-between items-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaChartPie className="text-blue-600 w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    آمار پروژه‌ها
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isStatsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-gray-600" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isStatsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <FaChartPie className="text-blue-500 w-5 h-5" />
                      <div>
                        <p className="text-xs text-gray-600">
                          تعداد کل پروژه‌ها
                        </p>
                        <p className="text-base font-bold text-gray-800">
                          {stats.total_projects}
                        </p>
                      </div>
                    </div>
                    {Object.entries(stats.status_counts).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaChartPie className="text-blue-500 w-5 h-5" />
                          <div>
                            <p className="text-xs text-gray-600">
                              {getRequestStatusName(status)}
                            </p>
                            <p className="text-base font-bold text-gray-800">
                              {count}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                    {Object.entries(stats.request_type_counts).map(
                      ([request_type, count]) => (
                        <div
                          key={request_type}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaChartPie className="text-blue-500 w-5 h-5" />
                          <div>
                            <p className="text-xs text-gray-600">
                              {getRequestTypeName(request_type)}
                            </p>
                            <p className="text-base font-bold text-gray-800">
                              {count}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="جستجو بر اساس عنوان پروژه..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch className="w-4 h-4" />
              </div>
            </div>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm"
              >
                <FaSpinner className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                <p className="text-sm text-gray-600 mt-2">در حال بارگذاری...</p>
              </motion.div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm"
              >
                <p className="text-sm text-gray-500">موردی یافت نشد.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    openProjectId={openProjectId}
                    setOpenProjectId={setOpenProjectId}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!previousPage}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                قبلی
              </button>
              <span className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg">
                صفحه {page} از {Math.ceil(totalCount / 10)}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!nextPage}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                بعدی
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, onFilterChange, setIsOpen, isMobile }) {
  const handleResetFilters = () => {
    onFilterChange({
      search: "",
      request_type: "all",
      request_status: "all",
      start_date: "",
      end_date: "",
      main_parcel_number: "",
      sub_parcel_number: "",
    });
    if (isMobile) setIsOpen(false);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    if (isMobile) setIsOpen(false);
  };

  const statusMap = {
    "در حال بررسی": "pending",
    "در حال انجام": "in_progress",
    "تکمیل شده": "completed",
    "رد شده": "rejected",
    ناقص: "incomplete",
  };

  const handleDateChange = (key, value) => {
    if (value) {
      const gregorianDate = value.toDate();
      const formattedDate = gregorianDate.toISOString().split("T")[0];
      onFilterChange({ [key]: formattedDate });
    } else {
      onFilterChange({ [key]: "" });
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-white ${
        isMobile ? "fixed inset-0 z-30 overflow-y-auto" : "p-4"
      }`}
    >
      <div
        className={`flex justify-between items-center border-b border-gray-200 ${
          isMobile ? "p-3 sticky top-0 bg-white z-10" : "mb-4"
        }`}
      >
        <h2 className="text-base font-bold text-gray-800">فیلترها</h2>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>
      <div
        className={`flex-grow space-y-3 ${isMobile ? "p-3 pt-2" : "space-y-4"}`}
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نوع درخواست
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap gap-1">
            <button
              onClick={() => onFilterChange({ request_type: "all" })}
              className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                filters.request_type === "all"
                  ? "bg-white shadow-sm font-semibold text-blue-600"
                  : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              همه
            </button>
            {[
              "survey",
              "supervision",
              "expert",
              "execution",
              "registration",
            ].map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange({ request_type: type })}
                className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                  filters.request_type === type
                    ? "bg-white shadow-sm font-semibold text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                {getRequestTypeName(type)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700"
          >
            وضعیت درخواست
          </label>
          <select
            id="status-filter"
            value={filters.request_status}
            onChange={(e) => onFilterChange({ request_status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            {Object.entries(statusMap).map(([fa, en]) => (
              <option key={en} value={en}>
                {fa}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ ثبت (شمسی)
          </label>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                از تاریخ
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                value={filters.start_date ? new Date(filters.start_date) : null}
                onChange={(value) => handleDateChange("start_date", value)}
                inputClassName="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                containerClassName="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                تا تاریخ
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                value={filters.end_date ? new Date(filters.end_date) : null}
                onChange={(value) => handleDateChange("end_date", value)}
                inputClassName="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            پلاک اصلی
          </label>
          <input
            type="text"
            placeholder="مثال: 1234"
            value={filters.main_parcel_number}
            onChange={(e) =>
              onFilterChange({ main_parcel_number: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            پلاک فرعی
          </label>
          <input
            type="text"
            placeholder="مثال: 567"
            value={filters.sub_parcel_number}
            onChange={(e) =>
              onFilterChange({ sub_parcel_number: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      {isMobile && (
        <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              اعمال فیلتر
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="flex-shrink-0 pt-3">
          <button
            onClick={handleResetFilters}
            className="w-full py-2 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, openProjectId, setOpenProjectId, isAdmin }) {
  const { id, title, created_at, owner, requests = [] } = project;

  // پیدا کردن آخرین درخواست با مختصات معتبر
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
        <div className="p-3 sm:p-4 ">
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full ring-1 ring-inset ring-gray-200">
              تعداد درخواست‌ها: {requests.length}
            </span>
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
        <div className="w-full  h-48">
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
                  <RequestCard key={req.id} request={req} isAdmin={isAdmin} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RequestCard({ request, isAdmin }) {
  const navigate = useNavigate();
  const {
    id,
    request_type,
    status,
    created_at,
    assigned_admin,
    specific_fields = {},
    tracking_code,
  } = request;

  const handleCardClick = async (e) => {
    e.stopPropagation();
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

function MiniMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window.L === "undefined" || !mapRef.current) return;
    if (mapInstance.current) mapInstance.current.remove();

    if (lat && lng) {
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });

      const position = [lat, lng];
      mapInstance.current = window.L.map(mapRef.current, {
        center: position,
        zoom: 13,
        dragging: false,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false,
      });
      window.L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ).addTo(mapInstance.current);
      window.L.marker(position).addTo(mapInstance.current);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng]);

  if (!lat || !lng) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded-xl border border-gray-300 shadow-inner">
        موقعیت ثبت نشده
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      title="مشاهده موقعیت روی نقشه"
      style={{ textDecoration: "none" }}
    >
      <div className="w-full h-48 rounded-xl rounded-top-0 border-2 border-blue-200 shadow-md overflow-hidden relative transition group-hover:border-blue-500 group-hover:shadow-lg">
        <div
          ref={mapRef}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
        ></div>
        <span className="absolute left-2 top-2 bg-white/80 text-blue-700 text-xs px-2 py-1 rounded shadow group-hover:bg-blue-50 transition">
          مشاهده روی نقشه
        </span>
      </div>
    </a>
  );
}

export default ProjectsList;
