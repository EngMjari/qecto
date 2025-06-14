import React, { useState, useEffect, useRef } from "react";
import { fetchUserRequests, fetchRequestDetail } from "../../api";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaChartPie,
  FaUserCheck,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";

const FiChevronsLeft = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="11 17 6 12 11 7"></polyline>
    <polyline points="18 17 13 12 18 7"></polyline>
  </svg>
);

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

// تابع برای دریافت نام وضعیت
const getStatusName = (status) => {
  const statuses = {
    pending: "در انتظار بررسی",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    rejected: "رد شده",
    incomplete: "نیاز به اصلاح",
  };
  return statuses[status] || "نامشخص";
};

// تابع برای دریافت کلاس‌های استایل وضعیت
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

function RequestListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get("search") || "",
      request_type: params.get("request_type") || "all",
      status: params.get("status") || "all",
      start_date: params.get("start_date") || "",
      end_date: params.get("end_date") || "",
      tracking_code: params.get("tracking_code") || "",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 0,
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

  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum };
      if (filters.search) params.search = filters.search;
      if (filters.request_type !== "all")
        params.request_type = filters.request_type;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.tracking_code) params.tracking_code = filters.tracking_code;

      const res = await fetchUserRequests(params);
      console.log("API Response:", res);
      setRequests(res.results || []);
      setStats(res.stats || {});
      setTotalCount(res.count || 0);
      setNextPage(res.next);
      setPreviousPage(res.previous);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
      setStats({
        total_requests: 0,
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
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    if (filters.tracking_code)
      params.set("tracking_code", filters.tracking_code);
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

  return (
    <div className="bg-gray-100 page-content min-h-screen font-vazir" dir="rtl">
      <div className="flex">
        <div className="w-72 flex-shrink-0 hidden md:block border-l border-gray-200 bg-white">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isMobile={false}
          />
        </div>
        <div
          className={`md:hidden fixed inset-0 z-30 transition-transform duration-300 ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
          ></div>
          <div className="relative w-72 h-full bg-white ml-auto">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              setIsOpen={setIsFilterOpen}
              isMobile={true}
            />
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                  لیست درخواست‌ها
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  درخواست‌های ثبت شده را مدیریت کنید. (تعداد کل:{" "}
                  {stats.total_requests})
                </p>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
              >
                <FaFilter />
              </button>
            </div>
            <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setIsStatsOpen(!isStatsOpen)}
                className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaChartPie className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    آمار درخواست‌ها
                  </h3>
                </div>
                {isStatsOpen ? (
                  <FaChevronUp className="text-gray-600" />
                ) : (
                  <FaChevronDown className="text-gray-600" />
                )}
              </button>
              {isStatsOpen && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(stats.request_type_counts || {}).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaChartPie className="text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {getRequestTypeName(type)}
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {count}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="جستجو بر اساس عنوان پروژه، توضیحات، شماره پروانه یا کد رهگیری..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </div>
            </div>
            {loading ? (
              <div className="text-center py-20">
                <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-lg text-gray-500">موردی یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {requests.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!previousPage}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
              >
                قبلی
              </button>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                صفحه {page} از {Math.ceil(totalCount / 10)}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!nextPage}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
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
      request_type: "all",
      status: "all",
      start_date: "",
      end_date: "",
      tracking_code: "",
      search: filters.search,
    });
    if (isMobile) setIsOpen(false); // بستن پنل در موبایل
  };

  const handleApplyFilters = () => {
    onFilterChange(filters); // اعمال فیلترهای فعلی
    if (isMobile) setIsOpen(false); // بستن پنل در موبایل
  };

  const statusMap = {
    "در انتظار بررسی": "pending",
    "در حال انجام": "in_progress",
    "تکمیل شده": "completed",
    "رد شده": "rejected",
    "نیاز به اصلاح": "incomplete",
  };

  const handleDateChange = (key, value) => {
    if (value) {
      // تبدیل تاریخ شمسی به میلادی
      const gregorianDate = value.toDate();
      const formattedDate = gregorianDate.toISOString().split("T")[0]; // yyyy-MM-dd
      onFilterChange({ [key]: formattedDate });
    } else {
      onFilterChange({ [key]: "" });
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-white ${
        isMobile
          ? "fixed inset-0 z-30 overflow-y-auto" // تمام‌صفحه در موبایل
          : "p-5"
      }`}
    >
      {/* سربرگ */}
      <div
        className={`flex justify-between items-center border-b border-gray-200 ${
          isMobile ? "p-4 sticky mt-16 bg-white z-10" : "mb-6"
        }`}
      >
        <h2 className="text-lg font-bold text-gray-800">فیلترها</h2>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* بدنه فیلترها */}
      <div
        className={`flex-grow space-y-4 ${isMobile ? "p-4 pt-2" : "space-y-6"}`}
      >
        {/* نوع درخواست */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نوع درخواست
          </label>
          <div className="flex bg-gray-100 p-1 rounded-xl flex-wrap gap-1.5">
            <button
              onClick={() => onFilterChange({ request_type: "all" })}
              className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                filters.request_type === "all"
                  ? "bg-white shadow-md font-semibold text-blue-600"
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
                    ? "bg-white shadow-md font-semibold text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                {getRequestTypeName(type)}
              </button>
            ))}
          </div>
        </div>

        {/* وضعیت درخواست */}
        <div className="space-y-2">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700"
          >
            وضعیت درخواست
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            {Object.entries(statusMap).map(([fa, en]) => (
              <option key={en} value={en}>
                {fa}
              </option>
            ))}
          </select>
        </div>

        {/* تاریخ ثبت */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ ثبت (شمسی)
          </label>
          <div className="grid grid-cols-1 gap-3">
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
                inputClassName="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                inputClassName="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>

        {/* کد رهگیری */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            کد رهگیری
          </label>
          <input
            type="text"
            placeholder="مثال: REQ-20250613-SUR-001"
            value={filters.tracking_code}
            onChange={(e) => onFilterChange({ tracking_code: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* دکمه‌ها */}
      {isMobile && (
        <div className="sticky bottom-0 mb-24 bg-white p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              اعمال فیلتر
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 py-2.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="flex-shrink-0 pt-4">
          <button
            onClick={handleResetFilters}
            className="w-full py-2.5 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }) {
  const navigate = useNavigate();

  const handleCardClick = async () => {
    try {
      const res = await fetchRequestDetail(request.id);
      navigate(`/requests/${request.id}`, { state: { request: res } });
    } catch (err) {
      console.error("Error fetching request detail:", err);
    }
  };

  const {
    id,
    project_title,
    request_type,
    status,
    created_at,
    assigned_admin,
    specific_fields: {
      area,
      building_area,
      main_parcel_number,
      sub_parcel_number,
      property_type,
      location_lat,
      location_lng,
      description,
    } = {},
    tracking_code,
  } = request;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row"
    >
      <div className="w-full h-48 md:w-52 md:h-auto flex-shrink-0">
        <MiniMap lat={location_lat} long={location_lng} />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(
                status
              )}`}
            >
              {getStatusName(status)}
            </span>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full ring-1 ring-inset ring-gray-200">
              {getRequestTypeName(request_type)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {project_title || "بدون عنوان"}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            تاریخ ثبت: {new Date(created_at).toLocaleDateString("fa-IR")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-gray-800">
                کد رهگیری:
              </strong>{" "}
              <span>{tracking_code || "در انتظار تخصیص"}</span>
            </div>
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-gray-800">نوع ملک:</strong>{" "}
              {getPropertyTypeName(property_type)}
            </div>
            {request_type === "survey" && area ? (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">مساحت:</strong>{" "}
                <span>{area.toLocaleString("fa-IR")} متر مربع</span>
              </div>
            ) : (request_type === "expert" ||
                request_type === "registration") &&
              main_parcel_number ? (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">
                  پلاک ثبتی:
                </strong>{" "}
                <span>
                  {main_parcel_number} / {sub_parcel_number || "بدون پلاک فرعی"}
                </span>
              </div>
            ) : null}
            {building_area && (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">
                  مساحت ساختمان:
                </strong>{" "}
                <span>{building_area.toLocaleString("fa-IR")} متر مربع</span>
              </div>
            )}
            {description && (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">
                  توضیحات:
                </strong>{" "}
                <span>{description}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-gray-800">
                وضعیت ارجاع:
              </strong>{" "}
              <span className="flex items-center gap-1">
                {assigned_admin ? (
                  <>
                    <FaUserCheck className="text-green-600" />
                    {assigned_admin.full_name || "نامشخص"}
                  </>
                ) : (
                  "ارجاع نشده"
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end items-center">
          <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 group">
            مشاهده جزئیات
            <FiChevronsLeft className="transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniMap({ lat, long }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window.L === "undefined" || !mapRef.current) return;
    if (mapInstance.current) mapInstance.current.remove();

    if (lat && long) {
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });

      const position = [lat, long];
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
  }, [lat, long]);

  if (!lat || !long) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
        موقعیت ثبت نشده
      </div>
    );
  }
  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
    ></div>
  );
}

export default RequestListPage;
