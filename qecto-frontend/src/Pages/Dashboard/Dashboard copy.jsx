import React, { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaProjectDiagram,
  FaEnvelopeOpenText,
  FaCheckCircle,
  FaExclamationCircle,
  FaHourglassHalf,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { IoIosCloseCircleOutline, IoMdSettings } from "react-icons/io";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import WelcomeCard from "./WelcomeCard";
import { fetchAllData } from "../../api/projectsApi";
import cx from "classnames";

// Utility functions for status
const getStatusColor = (status) => {
  const colors = {
    pending: "#f1c40f",
    in_progress: "#1abc9c",
    completed: "#28a745",
    incomplete: "#e67e22",
    rejected: "#dc3545",
  };
  return colors[status] || "#999";
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "در حال بررسی",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    incomplete: "دارای نقص",
    rejected: "رد شده",
  };
  return labels[status] || "نامشخص";
};

const getTicketStatusLabel = (status) => {
  const labels = {
    waiting_for_admin: "در انتظار پاسخ",
    answered: "پاسخ داده شده",
  };
  return labels[status] || "نامشخص";
};

const getTicketStatusColor = (status) => {
  const colors = {
    answered: "#28a745",
    waiting_for_admin: "#ffc107",
  };
  return colors[status] || "#999";
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData()
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "خطا در دریافت داده‌ها");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">در حال بارگذاری...</p>;
  if (error) return <p className="text-center text-red-500">خطا: {error}</p>;

  return (
    <div className="page-content" style={styles.container}>
      <WelcomeCard />
      <ProjectInfoCard
        requests={data.requests.length}
        user={data.user}
        requestsList={data.requests}
        projects={data.projects}
        tickets={data.latest_messages || []}
      />
      <SectionGrid
        recentRequests={
          Array.isArray(data?.latest_requests) ? data.latest_requests : []
        }
        recentTickets={
          Array.isArray(data?.latest_messages) ? data.latest_messages : []
        }
      />
    </div>
  );
}

function ProjectInfoCard({ requestsList = [], projects = [], tickets = [] }) {
  const [openAccordion, setOpenAccordion] = useState(null);
  const navigate = useNavigate();

  const statusList = [
    {
      key: "all",
      label: "کل درخواست‌ها",
      color: "#2563eb",
      icon: <FaClipboardList size={24} />,
      link: "/requests",
      value: requestsList.length,
    },
    {
      key: "pending",
      label: "در حال بررسی",
      color: "#f1c40f",
      icon: <FaHourglassHalf size={24} />,
      link: "/requests?status=pending",
      value: requestsList.filter((r) => r.status === "pending").length,
    },
    {
      key: "in_progress",
      label: "در حال انجام",
      color: "#1abc9c",
      icon: <IoMdSettings size={24} />,
      link: "/requests?status=in_progress",
      value: requestsList.filter((r) => r.status === "in_progress").length,
    },
    {
      key: "completed",
      label: "تکمیل شده",
      color: "#28a745",
      icon: <FaCheckCircle size={24} />,
      link: "/requests?status=completed",
      value: requestsList.filter((r) => r.status === "completed").length,
    },
    {
      key: "incomplete",
      label: "دارای نقص",
      color: "#e67e22",
      icon: <FaExclamationCircle size={24} />,
      link: "/requests?status=incomplete",
      value: requestsList.filter((r) => r.status === "incomplete").length,
    },
    {
      key: "rejected",
      label: "رد شده",
      color: "#dc3545",
      icon: <IoIosCloseCircleOutline size={24} />,
      link: "/requests?status=rejected",
      value: requestsList.filter((r) => r.status === "rejected").length,
    },
  ];

  const ticketStats = [
    {
      key: "all",
      label: "کل تیکت‌ها",
      color: "#2563eb",
      icon: <FaEnvelopeOpenText size={24} />,
      link: "/tickets",
      value: tickets.length,
    },
    {
      key: "answered",
      label: "پاسخ داده شده",
      color: "#28a745",
      icon: <FaCheckCircle size={24} />,
      link: "/tickets?status=answered",
      value: tickets.filter((t) => t.session?.reply_status === "answered")
        .length,
    },
    {
      key: "waiting_for_admin",
      label: "در انتظار پاسخ",
      color: "#ffc107",
      icon: <FaHourglassHalf size={24} />,
      link: "/tickets?status=waiting_for_admin",
      value: tickets.filter(
        (t) => t.session?.reply_status === "waiting_for_admin"
      ).length,
    },
  ];

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.13, rotate: 6 },
    tap: { scale: 0.97, rotate: -6 },
    active: { scale: 1.18, rotate: 0 },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl shadow-lg p-6 mb-8 border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-full w-10 h-10 flex items-center justify-center shadow">
            <FaClipboardList size={20} color="#fff" />
          </div>
          <span className="text-xl font-bold text-gray-800">کارتابل</span>
        </div>
        <div className="flex gap-3">
          {["projects", "requests", "tickets"].map((key) => (
            <button
              key={key}
              className={cx(
                "flex flex-col items-center px-2 py-1 rounded-lg transition font-bold",
                openAccordion === key
                  ? "bg-blue-100 text-blue-700 scale-110 shadow"
                  : "text-gray-500 hover:bg-blue-50"
              )}
              onClick={() =>
                setOpenAccordion(openAccordion === key ? null : key)
              }
            >
              <motion.span
                variants={iconVariants}
                animate={openAccordion === key ? "active" : "initial"}
                whileHover="hover"
                whileTap="tap"
                className="flex items-center justify-center bg-white rounded-full w-10 h-10"
                style={{
                  boxShadow:
                    openAccordion === key ? "0 0 0 3px #a5b4fc55" : "none",
                }}
              >
                {key === "projects" && (
                  <FaProjectDiagram size={25} color="#2563eb" />
                )}
                {key === "requests" && (
                  <FaClipboardList size={25} color="#1e293b" />
                )}
                {key === "tickets" && (
                  <FaEnvelopeOpenText size={25} color="#f59e42" />
                )}
              </motion.span>
              <span className="text-sm mt-1">
                {key === "projects"
                  ? "پروژه‌ها"
                  : key === "requests"
                  ? "درخواست‌ها"
                  : "تیکت‌ها"}
              </span>
            </button>
          ))}
        </div>
      </div>
      {openAccordion === "projects" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 cursor-pointer"
            onClick={() => navigate("/projects")}
          >
            <FaProjectDiagram size={24} color="#2563eb" />
            <span className="font-medium text-gray-700">کل پروژه‌ها</span>
            <span className="px-3 py-1 rounded-lg font-bold bg-blue-100 text-blue-700 ml-auto">
              {projects.length}
            </span>
          </motion.div>
        </div>
      )}
      {openAccordion === "requests" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {statusList.map(
            (item) =>
              item.value > 0 && (
                <motion.div
                  key={item.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 cursor-pointer"
                  onClick={() => navigate(item.link)}
                >
                  {item.icon}
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span
                    className="px-3 py-1 rounded-lg font-bold ml-auto"
                    style={{ background: item.color + "22", color: item.color }}
                  >
                    {item.value}
                  </span>
                </motion.div>
              )
          )}
        </div>
      )}
      {openAccordion === "tickets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ticketStats.map(
            (item) =>
              item.value > 0 && (
                <motion.div
                  key={item.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 cursor-pointer"
                  onClick={() => navigate(item.link)}
                >
                  {item.icon}
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span
                    className="px-3 py-1 rounded-lg font-bold ml-auto"
                    style={{ background: item.color + "22", color: item.color }}
                  >
                    {item.value}
                  </span>
                </motion.div>
              )
          )}
        </div>
      )}
    </div>
  );
}

function SectionGrid({ recentRequests = [], recentTickets = [] }) {
  const [openSections, setOpenSections] = useState({
    requests: false,
    tickets: false,
  });

  return (
    <div className="flex flex-wrap gap-5 mb-10">
      <div className="flex-1 min-w-[320px]">
        <DashboardSection
          title="آخرین درخواست‌ها"
          linkText="همه درخواست‌ها"
          linkHref="/requests"
          open={openSections.requests}
          onToggle={() =>
            setOpenSections((prev) => ({ ...prev, requests: !prev.requests }))
          }
        >
          {recentRequests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="hoverItem flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer"
            >
              <div className="flex flex-col flex-grow">
                <span>{req.project.title}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {req.request_type === "survey" ? "نقشه‌برداری" : "کارشناسی"}
                </span>
              </div>
              <span
                className="px-2 py-1 rounded-lg text-sm font-bold text-white text-center min-w-[100px]"
                style={{ backgroundColor: getStatusColor(req.status) }}
              >
                {getStatusLabel(req.status)}
              </span>
            </Link>
          ))}
        </DashboardSection>
      </div>
      <div className="flex-1 min-w-[320px]">
        <DashboardSection
          title="آخرین تیکت‌ها"
          linkText="همه تیکت‌ها"
          linkHref="/tickets"
          open={openSections.tickets}
          onToggle={() =>
            setOpenSections((prev) => ({ ...prev, tickets: !prev.tickets }))
          }
        >
          {recentTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/session/${ticket.session.id}`}
              className="hoverItem flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer"
            >
              <div className="flex flex-col flex-grow">
                <span>{ticket.session.title}</span>
                <span className="text-sm text-gray-500 mt-1">&nbsp;</span>
              </div>
              <span
                className="px-2 py-1 rounded-lg text-sm font-bold text-white text-center min-w-[100px]"
                style={{
                  backgroundColor: getTicketStatusColor(
                    ticket.session.reply_status
                  ),
                }}
              >
                {getTicketStatusLabel(ticket.session.reply_status)}
              </span>
            </Link>
          ))}
        </DashboardSection>
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  children,
  open,
  onToggle,
  linkText,
  linkHref,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-blue-100 mb-6">
      <button
        className="flex items-center justify-between w-full text-right font-bold text-blue-900 text-lg focus:outline-none"
        onClick={onToggle}
      >
        <span>{title}</span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      <div
        style={{
          maxHeight: open ? "1000px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), margin 0.3s",
          marginTop: open ? 16 : 0,
        }}
      >
        {open && <div>{children}</div>}
      </div>
      {linkText && linkHref && (
        <div className="text-left mt-2">
          <Link
            to={linkHref}
            className="text-orange-500 text-sm hover:underline"
          >
            {linkText}
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "10px 20px",
    fontFamily: "'Vazir', sans-serif",
    color: "#002a3a",
    backgroundColor: "#f5f5f5",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    color: "#002a3a",
    textDecoration: "none",
    fontSize: "0.95rem",
    gap: "8px",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    color: "#fff",
    fontWeight: "bold",
    minWidth: "100px",
    textAlign: "center",
  },
  itemColumn: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
};

// CSS for hover effects
const styleSheet = `
  .hoverItem:hover {
    background-color: rgba(255, 87, 0, 0.1);
    border-radius: 6px;
  }
`;
