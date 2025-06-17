import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChartPie,
  FaUserCheck,
  FaSpinner,
} from "react-icons/fa";
import { FiChevronsLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";
import { fetchTicketSessions } from "../../api";

// تابع برای دریافت نام نوع تیکت
const getSessionTypeName = (type) => {
  const types = {
    survey: "نقشه‌برداری",
    supervision: "نظارت",
    expert: "کارشناسی",
    execution: "اجرا",
    registration: "ثبت",
    general: "عمومی",
  };
  return types[type] || "نامشخص";
};

// تابع برای دریافت نام وضعیت
const getStatusName = (status, lastMessage, currentUserId) => {
  const statuses = {
    open: "باز",
    closed: "بسته",
  };

  if (statuses[status]) {
    return statuses[status];
  }

  if (lastMessage) {
    return lastMessage.sender_id === currentUserId
      ? "در انتظار پاسخ"
      : "پاسخ داده شده";
  }

  return "نامشخص";
};

// تابع برای دریافت کلاس‌های استایل وضعیت
const getStatusBadge = (status, lastMessage, currentUserId) => {
  const badges = {
    open: "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200",
    closed: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200",
  };

  if (badges[status]) {
    return badges[status];
  }

  if (lastMessage) {
    return lastMessage.sender_id === currentUserId
      ? "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200"
      : "bg-green-100 text-green-800 ring-1 ring-inset ring-green-200";
  }

  return "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200";
};

function TicketListPage({ showToast, currentUserId }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get("title") || "",
      session_type: params.get("session_type") || "all",
      status: params.get("status") || "all",
      start_date: params.get("created_at__gte") || "",
      end_date: params.get("created_at__lte") || "",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total_tickets: 0,
    status_counts: [],
    session_type_counts: [],
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
      const params = { page: pageNum, page_size: 10 };
      if (filters.search) params.title = filters.search;
      if (filters.session_type !== "all")
        params.session_type = filters.session_type;
      if (filters.status !== "all") {
        if (filters.status === "waiting_for_admin") {
          params.last_message_by = "user";
        } else if (filters.status === "answered") {
          params.last_message_by = "admin";
        } else {
          params.status = filters.status;
        }
      }
      if (filters.start_date) params.created_at__gte = filters.start_date;
      if (filters.end_date) params.created_at__lte = filters.end_date;

      const res = await fetchTicketSessions(params);
      let results = [];
      if (Array.isArray(res.results)) {
        results = res.results;
      } else if (res.results && Array.isArray(res.results.results)) {
        results = res.results.results;
      } else {
        console.warn("Unexpected results structure:", res.results);
        showToast("ساختار داده‌های تیکت نامعتبر است", "error");
      }

      setTickets(results);
      console.log(results);
      const statusCounts = res.stats?.status_counts?.map(
        ({ status, count }) => ({
          status,
          count,
        })
      ) || [
        { status: "open", count: res.stats?.open_count || 0 },
        { status: "closed", count: res.stats?.closed_count || 0 },
        { status: "waiting_for_admin", count: res.stats?.waiting_count || 0 },
        { status: "answered", count: res.stats?.answered_count || 0 },
      ];

      setStats({
        total_tickets: res.stats?.total_tickets || 0,
        status_counts: statusCounts,
        session_type_counts: Array.isArray(res.stats?.session_type_counts)
          ? res.stats.session_type_counts
          : [],
      });

      setTotalCount(res.count || 0);
      setNextPage(res.next);
      setPreviousPage(res.previous);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setTickets([]);
      setStats({
        total_tickets: 0,
        status_counts: [],
        session_type_counts: [],
      });
      showToast("خطا در بارگذاری تیکت‌ها", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("title", filters.search);
    if (filters.session_type !== "all")
      params.set("session_type", filters.session_type);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.start_date) params.set("created_at__gte", filters.start_date);
    if (filters.end_date) params.set("created_at__lte", filters.end_date);
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

  // انیمیشن‌ها
  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="bg-gray-50 min-h-screen font-vazir" dir="rtl">
      <div className="flex">
        {/* سایدبار فیلتر در دسکتاپ */}
        <div className="w-64 flex-shrink-0 hidden lg:block border-l border-gray-200 bg-white shadow-sm">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isMobile={false}
          />
        </div>
        {/* سایدبار فیلتر در موبایل */}
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
        {/* محتوای اصلی */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 page-content">
          <div className="max-w-5xl mx-auto">
            {/* هدر */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  لیست تیکت‌ها
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
            {/* بخش آمار */}
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
                    آمار تیکت‌ها
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
                          تعداد کل تیکت‌ها
                        </p>
                        <p className="text-base font-bold text-gray-800">
                          {stats.total_tickets}
                        </p>
                      </div>
                    </div>
                    {stats.status_counts.map(({ status, count }) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaChartPie className="text-blue-500 w-5 h-5" />
                        <div>
                          <p className="text-xs text-gray-600">
                            {getStatusName(status, null, currentUserId)}
                          </p>
                          <p className="text-base font-bold text-gray-800">
                            {count}
                          </p>
                        </div>
                      </div>
                    ))}
                    {stats.session_type_counts.map(
                      ({ session_type, count }) => (
                        <div
                          key={session_type}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaChartPie className="text-blue-500 w-5 h-5" />
                          <div>
                            <p className="text-xs text-gray-600">
                              {getSessionTypeName(session_type)}
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
            {/* نوار جستجو */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="جستجو بر اساس عنوان تیکت..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch className="w-4 h-4" />
              </div>
            </div>
            {/* محتوای تیکت‌ها */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm"
              >
                <FaSpinner className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                <p className="text-sm text-gray-600 mt-2">در حال بارگذاری...</p>
              </motion.div>
            ) : tickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm"
              >
                <p className="text-sm text-gray-500">موردی یافت نشد.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
            {/* صفحه‌بندی */}
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
      session_type: "all",
      status: "all",
      start_date: "",
      end_date: "",
      search: filters.search,
    });
    if (isMobile) setIsOpen(false);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    if (isMobile) setIsOpen(false);
  };

  const statusMap = {
    باز: "open",
    بسته: "closed",
    "در انتظار پاسخ": "waiting_for_admin",
    "پاسخ داده شده": "answered",
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
            نوع تیکت
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap gap-1">
            <button
              onClick={() => onFilterChange({ session_type: "all" })}
              className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                filters.session_type === "all"
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
              "general",
            ].map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange({ session_type: type })}
                className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                  filters.session_type === type
                    ? "bg-white shadow-sm font-semibold text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                {getSessionTypeName(type)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700"
          >
            وضعیت تیکت
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
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

function TicketCard({ ticket, currentUserId }) {
  const navigate = useNavigate();

  const handleRequestClick = (e) => {
    e.stopPropagation();
    navigate(`/requests/${ticket.related_request_id}`);
  };

  const handleTicketClick = (e) => {
    e.stopPropagation();
    navigate(`/tickets/session/${ticket.id}`);
  };

  const {
    title,
    session_type,
    status,
    created_at,
    assigned_admin,
    related_request_id,
    messages,
    related_request,
  } = ticket;

  const lastMessage =
    messages?.length > 0 ? messages[messages.length - 1] : null;

  const responseStatus =
    status === "open" && lastMessage
      ? lastMessage.sender_id === currentUserId
        ? "در انتظار پاسخ"
        : "پاسخ داده شده"
      : null;

  // انیمیشن‌های کارت
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" },
  };

  // انیمیشن‌های دکمه
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-100"
    >
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* سربرگ: وضعیت و نوع تیکت */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadge(
                status,
                lastMessage,
                currentUserId
              )}`}
            >
              {getStatusName(status, lastMessage, currentUserId)}
            </span>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full ring-1 ring-inset ring-gray-200">
              {getSessionTypeName(session_type)}
            </span>
          </div>

          {/* عنوان */}
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2 line-clamp-2">
            {title || "بدون عنوان"}
          </h3>

          {/* اطلاعات متا */}
          <div className="space-y-1 mb-3">
            <p className="text-xs text-gray-400">
              تاریخ ثبت: {new Date(created_at).toLocaleDateString("fa-IR")}
            </p>
            {lastMessage && (
              <p className="text-xs text-gray-400">
                تاریخ آخرین پیام:{" "}
                {new Date(lastMessage.created_at).toLocaleDateString("fa-IR")}
              </p>
            )}
            {responseStatus && (
              <p className="text-xs text-gray-600">
                وضعیت پاسخ: {responseStatus}
              </p>
            )}
          </div>

          {/* شبکه اطلاعات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-700">
            {related_request_id && session_type !== "general" && (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">
                  مرتبط با:
                </strong>
                <span className="text-gray-600">
                  درخواست{" "}
                  {related_request.project_title || `ID: ${related_request.id}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-gray-800">
                تعداد پیام‌ها:
              </strong>
              <span>{messages?.length || 0}</span>
            </div>
            {assigned_admin && (
              <div className="flex items-center gap-2">
                <strong className="font-semibold text-gray-800">
                  وضعیت ارجاع:
                </strong>
                <span className="flex items-center gap-1">
                  <FaUserCheck className="text-green-600 w-4 h-4" />
                  ارجاع به {assigned_admin.full_name || "نامشخص"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* بخش اقدامات */}
        <div className="mt-3 flex flex-col sm:flex-row justify-end items-center gap-2 pt-3 border-t border-gray-100">
          {related_request_id && session_type !== "general" && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleRequestClick}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              مشاهده درخواست
              <FiChevronsLeft className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleTicketClick}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            مشاهده تیکت
            <FiChevronsLeft className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default TicketListPage;
