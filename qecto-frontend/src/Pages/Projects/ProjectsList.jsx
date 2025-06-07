import React, { useState, useEffect, useRef } from "react";
import { fetchProjects } from "api/projectsApi";
import { FaChevronDown, FaChevronUp, FaFilter, FaTimes } from "react-icons/fa";

// وضعیت پروژه به فارسی
const getProjectStatusName = (status) => {
  switch (status) {
    case "pending":
      return "در حال بررسی";
    case "in_progress":
      return "در حال انجام";
    case "completed":
      return "تکمیل شده";
    case "rejected":
      return "رد شده";
    case "assigned":
      return "ارجاع داده‌شده";
    case "incomplete":
      return "ناقص";
    default:
      return "نامشخص";
  }
};

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
    case "assigned":
      return "bg-purple-100 text-purple-800 ring-1 ring-inset ring-purple-200";
    case "incomplete":
      return "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200";
    default:
      return "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200";
  }
};

const requestTypeOptions = [
  { value: "all", label: "همه انواع درخواست" },
  { value: "survey", label: "نقشه‌برداری" },
  { value: "expert", label: "کارشناسی" },
];

const statusOptions = [
  { value: "all", label: "همه وضعیت‌های پروژه" },
  { value: "pending", label: "در حال بررسی" },
  { value: "assigned", label: "ارجاع داده‌شده" },
  { value: "rejected", label: "ردشده یا نیاز به اصلاح" },
  { value: "in_progress", label: "در حال انجام" },
  { value: "completed", label: "اتمام‌یافته" },
];

const requestStatusOptions = [
  { value: "all", label: "همه وضعیت‌های درخواست" },
  { value: "pending", label: "در حال بررسی" },
  { value: "in_progress", label: "در حال انجام" },
  { value: "completed", label: "تکمیل شده" },
  { value: "rejected", label: "رد شده" },
  { value: "incomplete", label: "ناقص" },
];

const getPropertyTypeName = (type) => {
  switch (type) {
    case "field":
      return "زمین";
    case "building":
      return "ساختمان";
    default:
      return "نامشخص";
  }
};

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    main_parcel_number: "",
    sub_parcel_number: "",
    request_type: "all",
    status: "all", // وضعیت پروژه
    request_status: "all", // وضعیت درخواست
  });
  const [loading, setLoading] = useState(true);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // گرفتن پروژه‌ها با فیلتر
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.title) params.title = filters.title;
      if (filters.main_parcel_number)
        params.main_parcel_number = filters.main_parcel_number;
      if (filters.sub_parcel_number)
        params.sub_parcel_number = filters.sub_parcel_number;
      if (filters.request_type !== "all")
        params.request_type = filters.request_type;
      if (filters.status !== "all") params.status = filters.status; // وضعیت پروژه
      if (filters.request_status !== "all")
        params.request_status = filters.request_status; // وضعیت درخواست
      const res = await fetchProjects(params);
      setProjects(res.data?.results || res.data);
    } catch (err) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      title: "",
      main_parcel_number: "",
      sub_parcel_number: "",
      request_type: "all",
      status: "all",
      request_status: "all",
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen font-vazir" dir="rtl">
      <div className="flex">
        {/* سایدبار فیلتر دسکتاپ */}
        <div className="w-72 flex-shrink-0 hidden md:block border-l border-gray-200 bg-white">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>
        {/* پنل فیلتر موبایل */}
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
              onReset={handleResetFilters}
              setIsOpen={setIsFilterOpen}
              isMobile={true}
            />
          </div>
        </div>
        {/* محتوای اصلی */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* جستجو بر اساس نام پروژه بالای لیست */}
            <div className="flex justify-center mb-8">
              <div className="relative w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="جستجو بر اساس عنوان پروژه..."
                  value={filters.title}
                  onChange={(e) =>
                    handleFilterChange({ title: e.target.value })
                  }
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-base bg-white shadow-sm"
                  style={{ fontFamily: "inherit" }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-3.5-3.5" />
                  </svg>
                </span>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 md:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
                  aria-label="فیلتر"
                  type="button"
                >
                  <FaFilter />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-10 text-gray-600">
                در حال بارگذاری...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                <p className="text-lg text-gray-500">پروژه‌ای یافت نشد.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl shadow p-5"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setOpenProjectId(
                          openProjectId === project.id ? null : project.id
                        )
                      }
                    >
                      <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">
                          {project.title}
                        </h2>
                        <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                          <span>
                            تاریخ ساخت:{" "}
                            {new Date(project.created_at).toLocaleDateString(
                              "fa-IR"
                            )}
                          </span>
                          {project.assigned_to && (
                            <span>
                              ارجاع به:{" "}
                              {project.assigned_to?.full_name || "نامشخص"}
                            </span>
                          )}
                          <span>
                            وضعیت: {getProjectStatusName(project.status)}
                          </span>
                          <span>
                            تعداد درخواست‌ها:{" "}
                            <span className="font-bold text-blue-700">
                              {project.request_count}
                            </span>
                          </span>
                        </div>
                      </div>
                      <span className="text-blue-600 flex items-center gap-1">
                        {openProjectId === project.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </span>
                    </div>
                    {openProjectId === project.id && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                          {project.requests.length === 0 ? (
                            <div className="text-gray-500 text-center">
                              درخواستی برای این پروژه ثبت نشده است.
                            </div>
                          ) : (
                            project.requests.map((req) => (
                              <RequestCard key={req.id} request={req} />
                            ))
                          )}
                        </div>
                        <div>
                          {/* نقشه: مختصات را از اولین درخواست دارای مختصات معتبر بگیر */}
                          {(() => {
                            const firstWithLocation = project.requests.find(
                              (r) =>
                                (r.location_lat || r.lat) &&
                                (r.location_lng || r.lng) &&
                                !isNaN(Number(r.location_lat || r.lat)) &&
                                !isNaN(Number(r.location_lng || r.lng))
                            );
                            const lat = firstWithLocation
                              ? Number(
                                  firstWithLocation.location_lat ||
                                    firstWithLocation.lat
                                )
                              : null;
                            const long = firstWithLocation
                              ? Number(
                                  firstWithLocation.location_lng ||
                                    firstWithLocation.lng
                                )
                              : null;
                            return <MiniMap lat={lat} long={long} />;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// سایدبار فیلتر پروژه‌ها
function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  setIsOpen,
  isMobile,
}) {
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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            عنوان پروژه
          </label>
          <input
            type="text"
            placeholder="جستجو بر اساس عنوان پروژه..."
            value={filters.title}
            onChange={(e) => onFilterChange({ title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            پلاک اصلی درخواست
          </label>
          <input
            type="text"
            placeholder="پلاک اصلی"
            value={filters.main_parcel_number}
            onChange={(e) =>
              onFilterChange({ main_parcel_number: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            پلاک فرعی درخواست
          </label>
          <input
            type="text"
            placeholder="پلاک فرعی"
            value={filters.sub_parcel_number}
            onChange={(e) =>
              onFilterChange({ sub_parcel_number: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نوع درخواست
          </label>
          <select
            value={filters.request_type}
            onChange={(e) => onFilterChange({ request_type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          >
            {requestTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            وضعیت پروژه
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            وضعیت درخواست
          </label>
          <select
            value={filters.request_status}
            onChange={(e) => onFilterChange({ request_status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300"
          >
            {requestStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={onReset}
          className="w-full py-2.5 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
        >
          پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
}

// کارت نمایش هر درخواست (لینک به صفحه درخواست)
function RequestCard({ request }) {
  const {
    id,
    type,
    property_type,
    area,
    main_parcel_number,
    sub_parcel_number,
    status,
    created_at,
  } = request;
  return (
    <a
      href={`/requests/${id}`}
      className="block bg-gray-50 rounded-xl shadow-sm p-4 flex flex-col gap-2 hover:bg-blue-50 transition"
      style={{ textDecoration: "none" }}
    >
      <div className="flex gap-2 items-center">
        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
          {type === "survey" && "نقشه‌برداری"}
          {type === "expert" && "کارشناسی"}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadge(
            status
          )}`}
        >
          {getProjectStatusName(status)}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(created_at).toLocaleDateString("fa-IR")}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
        {property_type && (
          <span>
            <b>نوع ملک:</b> {getPropertyTypeName(property_type)}
          </span>
        )}
        {area && (
          <span>
            <b>مساحت:</b> {area} متر
          </span>
        )}
        {main_parcel_number && (
          <span>
            <b>پلاک:</b> {main_parcel_number}
            {sub_parcel_number ? ` / ${sub_parcel_number}` : ""}
          </span>
        )}
      </div>
    </a>
  );
}

// نقشه کوچک کنار هر پروژه
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
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded-xl border border-gray-300 shadow-inner">
        موقعیت ثبت نشده
      </div>
    );
  }

  // لینک به Google Maps
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      title="مشاهده موقعیت روی نقشه"
      style={{ textDecoration: "none" }}
    >
      <div className="w-full h-40 rounded-xl border-2 border-blue-200 shadow-md overflow-hidden relative transition group-hover:border-blue-500 group-hover:shadow-lg">
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
