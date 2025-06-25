import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilter,
  FaChartPie,
  FaChevronDown,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";
import { AuthContext } from "Contexts/AuthContext";
import FilterSidebar from "./FilterSidebar";
import ProjectCard from "./ProjectCard";
import ReferralModal from "./ReferralModal";
import LoadingScreen from "Pages/LoadingScreen/LoadingScreen";
import { fetchProjects, referProject, createReferral } from "../../api";

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

function ProjectsList({ showToast }) {
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
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralType, setReferralType] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [isReferring, setIsReferring] = useState(false);

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

  const handleReferralSubmit = async (formValues) => {
    setIsReferring(true);
    try {
      if (referralType === "project") {
        const res = await referProject(referralData.id, formValues);
        showToast(`پروژه ${referralData.title} با موفقیت ارجاع شد.`);
        fetchData(page);
      } else if (referralType === "request") {
        const contentTypeMap = {
          survey: "surveyrequest",
          supervision: "supervisionrequest",
          expert: "expertevaluationrequest",
          execution: "executionrequest",
          registration: "registrationrequest",
        };
        const contentTypeId = await getContentTypeId(
          contentTypeMap[referralData.request_type]
        );
        const res = await createReferral({
          content_type: contentTypeId,
          object_id: referralData.id,
          assigned_admin: formValues.assigned_admin,
          description: formValues.description,
        });
        alert(
          `درخواست ${getRequestTypeName(
            referralData.request_type
          )} با موفقیت ارجاع شد.`
        );
        fetchData(page);
      }
      setIsReferralModalOpen(false);
    } catch (err) {
      console.error("خطا در ارجاع:", err);
      alert("خطایی در ارجاع رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsReferring(false);
    }
  };

  const getContentTypeId = async (modelName) => {
    const contentTypeMap = {
      surveyrequest: 1,
      supervisionrequest: 2,
      expertevaluationrequest: 3,
      executionrequest: 4,
      registrationrequest: 5,
    };
    return contentTypeMap[modelName] || 1;
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
                    setReferralType={setReferralType}
                    setReferralData={setReferralData}
                    setIsReferralModalOpen={setIsReferralModalOpen}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={loading || !previousPage}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                قبلی
              </button>
              <span className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg">
                صفحه {page} از {Math.ceil(totalCount / 10)}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={loading || !nextPage}
                className="px-3 py-1.5 text-sm bg-white border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                بعدی
              </button>
            </div>
            <ReferralModal
              isOpen={isReferralModalOpen}
              onClose={() => setIsReferralModalOpen(false)}
              onSubmit={handleReferralSubmit}
              title={
                referralType === "project"
                  ? `ارجاع پروژه: ${referralData?.title || "بدون عنوان"}`
                  : `ارجاع درخواست: ${getRequestTypeName(
                      referralData?.request_type || ""
                    )}`
              }
              isLoading={isReferring}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProjectsList;
