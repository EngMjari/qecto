import React, { useState, useEffect, useRef } from "react";
import { fetchAllRequests } from "../../api";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
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

// --- داده‌های نمونه برای نمایش و تست ---
const getRequestTypeName = (type) => {
  switch (type) {
    case "survey":
      return "نقشه برداری";
    case "expert":
      return "کارشناسی";
    case "legal":
      return "امور حقوقی";
    case "other":
      return "سایر";
    default:
      return "نامشخص";
  }
};
// تابع برای دریافت نام وضعیت بر اساس مقدار آن
const getStatusName = (status) => {
  switch (status) {
    case "pending":
      return "در انتظار بررسی";
    case "in_progress":
      return "در حال انجام";
    case "completed":
      return "تکمیل شده";
    case "rejected":
      return "رد شده";
    case "incomplete":
      return "نیاز به اصلاح";
    default:
      return "نامشخص";
  }
};
// تابع برای دریافت کلاس‌های استایل بر اساس وضعیت درخواست
const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 ring-1 ring-inset ring-green-200";
    case "rejected":
      return "bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-200";
    case "incomplete":
      return "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200";
    default:
      return "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200";
  }
};
const getPropertyTypeName = (type) => {
  switch (type) {
    case "field":
      return "زمین";
    case "Building":
      return "ساختمان";
    case "other":
      return "سایر";
    default:
      return "نامشخص";
  }
};

function RequestListPage() {
  const location = useLocation();

  // مقدار اولیه فیلترها را از query string بگیر
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      title: "",
      requestType: "all",
      status: params.get("status") || "all",
      main_parcel_number: "",
      sub_parcel_number: "",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]); // اضافه شد
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availableRequestTypes, setAvailableRequestTypes] = useState([]);

  // گرفتن همه درخواست‌ها (بدون فیلتر)
  const fetchAllRequestsList = async () => {
    try {
      const res = await fetchAllRequests({});
      const data = res.data?.results || res.data;
      setAllRequests(data);
      // اگر هیچ فیلتری فعال نیست، requests را هم مقداردهی کن
      if (
        !filters.title &&
        filters.requestType === "all" &&
        filters.status === "all" &&
        !filters.main_parcel_number &&
        !filters.sub_parcel_number
      ) {
        setRequests(data);
      }
    } catch (err) {
      setAllRequests([]);
    }
  };

  // گرفتن درخواست‌های فیلترشده
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.title) params.title = filters.title;
      if (filters.requestType !== "all") params.type = filters.requestType;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.main_parcel_number)
        params.main_parcel_number = filters.main_parcel_number;
      if (filters.sub_parcel_number)
        params.sub_parcel_number = filters.sub_parcel_number;
      const res = await fetchAllRequests(params);
      setRequests(res.data?.results || res.data);
      console.log("Filtered Requests:", res.data?.results || res.data);
    } catch (err) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری اولیه همه درخواست‌ها
  useEffect(() => {
    fetchAllRequestsList();
  }, []);

  // هر بار که فیلتر تغییر کرد، داده فیلترشده را بگیر
  useEffect(() => {
    fetchData();
  }, [filters]);

  // استخراج انواع درخواست از allRequests (همیشه کامل)
  useEffect(() => {
    if (allRequests.length > 0) {
      const types = new Set(allRequests.map((req) => req.request_type));
      setAvailableRequestTypes(Array.from(types));
    }
  }, [allRequests]);

  // وقتی صفحه لود شد یا location تغییر کرد، فیلتر را از query string بخوان
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) {
      setFilters((prev) => ({ ...prev, status }));
    }
    // اگر فیلترهای دیگری هم داری، همین کار را برای آن‌ها انجام بده
  }, [location.search]);

  // اگر کاربر از صفحه دیگری با query string آمد، فیلتر را sync کن
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status && status !== filters.status) {
      setFilters((prev) => ({ ...prev, status }));
    }
    // اگر فیلترهای دیگری هم داری، همین کار را برای آن‌ها انجام بده
    // (مثلاً requestType و ...)
  }, [location.search]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="bg-gray-100 min-h-screen font-vazir" dir="rtl">
      <div className="flex">
        {/* سایدبار برای دسکتاپ */}
        <div className="w-72 flex-shrink-0 hidden md:block border-l border-gray-200 bg-white">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            availableRequestTypes={availableRequestTypes}
            isMobile={false}
          />
        </div>

        {/* سایدبار کشویی برای موبایل */}
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
              availableRequestTypes={availableRequestTypes}
              setIsOpen={setIsFilterOpen}
              isMobile={true}
            />
          </div>
        </div>

        {/* محتوای اصلی */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                  لیست درخواست‌ها
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  درخواست‌های ثبت شده را مدیریت کنید.
                </p>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
              >
                <FaFilter />
              </button>
            </div>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="جستجو بر اساس عنوان پروژه..."
                value={filters.title}
                onChange={(e) => handleFilterChange({ title: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </div>
            </div>
            {loading ? (
              <div className="text-center py-20">
                <p className="text-gray-600 font-medium">درحال بارگذاری...</p>
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
          </div>
        </main>
      </div>
    </div>
  );
}

// FilterSidebar component for filtering requests
function FilterSidebar({
  filters,
  onFilterChange,
  availableRequestTypes,
  setIsOpen,
  isMobile,
}) {
  const handleResetFilters = () => {
    onFilterChange({
      requestType: "all",
      status: "all",
      main_parcel_number: "",
      sub_parcel_number: "",
      title: filters.title,
    });
  };

  const statusMap = {
    "تکمیل شده": "completed",
    "رد شده": "rejected",
    "نیاز به اصلاح": "incomplete",
    "در حال بررسی": "pending",
    "در دست اقدام": "in_progress",
  };

  return (
    <div className="p-5 space-y-7 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">فیلترها</h2>
        {isMobile && (
          <button onClick={() => setIsOpen(false)} className="p-1">
            <FaTimes />
          </button>
        )}
      </div>

      <div className="flex-grow space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            نوع درخواست
          </label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onFilterChange({ requestType: "all" })}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                filters.requestType === "all"
                  ? "bg-white shadow-md font-semibold text-blue-600"
                  : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              همه
            </button>
            {availableRequestTypes.map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange({ requestType: type })}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                  filters.requestType === type
                    ? "bg-white shadow-md font-semibold text-blue-600"
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
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            پلاک ثبتی
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="اصلی"
              value={filters.main_parcel_number}
              onChange={(e) =>
                onFilterChange({ main_parcel_number: e.target.value })
              }
              className="w-full px-3 py-2 text-center bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="فرعی"
              value={filters.sub_parcel_number}
              onChange={(e) =>
                onFilterChange({ sub_parcel_number: e.target.value })
              }
              className="w-full px-3 py-2 text-center bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          onClick={handleResetFilters}
          className="w-full py-2.5 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
        >
          پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
}

// Card component to display each request
function RequestCard({ request }) {
  const navigate = useNavigate();
  const handleCardClick = () => {
    // اگر نیاز به ارسال اطلاعات درخواست به صفحه جزئیات است، می‌توانیم از useNavigate استفاده کنیم
    // و اطلاعات درخواست را به عنوان state ارسال کنیم
    navigate(`/requests/${request.id}`, {
      state: { request }, // ارسال اطلاعات درخواست به صفحه جزئیات
    });
  };
  const {
    project,
    request_type,
    property_type,
    area,
    main_parcel_number,
    sub_parcel_number,
    status,
    created_at,
    location_lat,
    location_lng,
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
            {project?.title || "بدون عنوان"}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            تاریخ ثبت: {new Date(created_at).toLocaleDateString("fa-IR")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-gray-800">نوع ملک:</strong>{" "}
              {getPropertyTypeName(property_type)}
            </div>
            {request_type === "survey" && area ? (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">مساحت:</strong>{" "}
                <span>{area.toLocaleString("fa-IR")} متر مربع</span>
              </div>
            ) : request_type === "expert" && main_parcel_number ? (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">
                  پلاک ثبتی:
                </strong>{" "}
                <span>
                  {main_parcel_number} / {sub_parcel_number || "بدون پلاک فرعی"}
                </span>
              </div>
            ) : null}
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

// MiniMap component to display a small map with a marker
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
