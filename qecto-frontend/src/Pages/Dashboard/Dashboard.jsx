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

  if (loading) return <p className="text-center py-8">در حال بارگذاری...</p>;
  if (error)
    return <p className="text-center text-red-500 py-8">خطا: {error}</p>;

  return (
    <div className="font-vazir page-content text-gray-800 bg-gray-50 p-5">
      <WelcomeCard />
      <ProjectInfoCard
        requests={data.requests.length}
        requestsList={data.requests}
        projects={data.projects}
        tickets={data.latest_messages || []}
      />
      <SectionGrid
        recentRequests={data.latest_requests || []}
        recentTickets={data.latest_messages || []}
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
    hover: { scale: 1.13, rotate: 6 },
    tap: { scale: 0.97 },
    active: { scale: 1.18 },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-5 mb-6 border border-indigo-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-full w-10 h-10 flex items-center justify-center shadow">
            <FaClipboardList className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-800">کارتابل</span>
        </div>

        <div className="flex gap-2">
          {[
            {
              key: "projects",
              icon: <FaProjectDiagram size={25} color="#2563eb" />,
              label: "پروژه‌ها",
            },
            {
              key: "requests",
              icon: <FaClipboardList size={25} color="#1e293b" />,
              label: "درخواست‌ها",
            },
            {
              key: "tickets",
              icon: <FaEnvelopeOpenText size={25} color="#f59e42" />,
              label: "تیکت‌ها",
            },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition font-bold ${
                openAccordion === key
                  ? "bg-blue-100 text-blue-700 scale-105 shadow"
                  : "text-gray-500 hover:bg-blue-50"
              }`}
              onClick={() =>
                setOpenAccordion(openAccordion === key ? null : key)
              }
            >
              <motion.span
                variants={iconVariants}
                animate={openAccordion === key ? "active" : "initial"}
                whileHover="hover"
                whileTap="tap"
                className={`flex items-center justify-center bg-white rounded-full w-10 h-10 ${
                  openAccordion === key ? "ring-3 ring-blue-300" : ""
                }`}
              >
                {icon}
              </motion.span>
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {openAccordion && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {(openAccordion === "projects"
            ? [
                {
                  label: "کل پروژه‌ها",
                  value: projects.length,
                  icon: <FaProjectDiagram size={24} color="#2563eb" />,
                  link: "/projects",
                  color: "#2563eb",
                },
              ]
            : openAccordion === "requests"
            ? statusList
            : ticketStats
          )
            .filter((item) => item.value > 0)
            .map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-blue-50 rounded-xl shadow-sm p-3 border border-blue-100 cursor-pointer"
                onClick={() => navigate(item.link)}
              >
                {item.icon}
                <span className="font-medium text-gray-700 text-sm flex-grow">
                  {item.label}
                </span>
                <span
                  className="px-2 py-1 rounded-lg font-bold text-sm"
                  style={{
                    background: `${item.color}22`,
                    color: item.color,
                  }}
                >
                  {item.value}
                </span>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}

function SectionGrid({ recentRequests = [], recentTickets = [] }) {
  const [openSections, setOpenSections] = useState({
    requests: true,
    tickets: true,
  });

  return (
    <div className="flex flex-col md:flex-row gap-5 mb-10">
      <DashboardSection
        title="آخرین درخواست‌ها"
        linkText="همه درخواست‌ها"
        linkHref="/requests"
        open={openSections.requests}
        onToggle={() =>
          setOpenSections((prev) => ({ ...prev, requests: !prev.requests }))
        }
        isEmpty={recentRequests.length === 0}
      >
        {recentRequests.map((req) => (
          <Link
            key={req.id}
            to={`/requests/${req.id}`}
            className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-orange-50 hover:rounded-md transition-colors"
          >
            <div className="flex flex-col flex-grow">
              <span className="font-medium">{req.project.title}</span>
              <span className="text-xs text-gray-500 mt-1">
                {req.request_type === "survey" ? "نقشه‌برداری" : "کارشناسی"}
              </span>
            </div>
            <span
              className="px-2 py-1 rounded-lg text-xs font-bold text-white text-center min-w-[90px]"
              style={{ backgroundColor: getStatusColor(req.status) }}
            >
              {getStatusLabel(req.status)}
            </span>
          </Link>
        ))}
      </DashboardSection>

      <DashboardSection
        title="آخرین تیکت‌ها"
        linkText="همه تیکت‌ها"
        linkHref="/tickets"
        open={openSections.tickets}
        onToggle={() =>
          setOpenSections((prev) => ({ ...prev, tickets: !prev.tickets }))
        }
        isEmpty={recentTickets.length === 0}
      >
        {recentTickets.map((ticket) => (
          <Link
            key={ticket.id}
            to={`/tickets/session/${ticket.session.id}`}
            className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-orange-50 hover:rounded-md transition-colors"
          >
            <div className="flex flex-col flex-grow">
              <span className="font-medium">{ticket.session.title}</span>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
              </span>
            </div>
            <span
              className="px-2 py-1 rounded-lg text-xs font-bold text-white text-center min-w-[90px]"
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
  );
}

function DashboardSection({
  title,
  children,
  open,
  onToggle,
  linkText,
  linkHref,
  isEmpty,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-blue-100 flex-1 min-w-[300px]">
      <button
        className="flex items-center justify-between w-full text-right font-bold text-blue-900 text-lg focus:outline-none"
        onClick={onToggle}
      >
        <span>{title}</span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      <div
        className="overflow-hidden transition-all duration-400"
        style={{ maxHeight: open ? "1000px" : "0", marginTop: open ? 16 : 0 }}
      >
        {open &&
          (isEmpty ? (
            <p className="text-center text-gray-500 py-4">داده‌ای موجود نیست</p>
          ) : (
            <div>{children}</div>
          ))}
      </div>

      {linkText && linkHref && (
        <div className="text-left mt-3">
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
