import React, { useEffect, useState, useContext } from "react";
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
import { useNavigate } from "react-router-dom";
import WelcomeCard from "./WelcomeCard";
import TicketModal from "../Requests/Components/TicketModal";
import {
  fetchProjects,
  fetchUserRequests,
  fetchTicketSessions,
  sendTicketMessage,
} from "../../api";
import { AuthContext } from "../../Contexts/AuthContext";

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

const getTicketStatus = (ticket, userId) => {
  if (ticket.status === "closed") {
    return "closed";
  }
  if (!ticket.messages || ticket.messages.length === 0) {
    return "waiting_for_admin";
  }
  const lastMessage = ticket.messages[ticket.messages.length - 1];
  return lastMessage.sender.id === userId ? "waiting_for_admin" : "answered";
};

const getTicketStatusLabel = (ticket, userId) => {
  const status = getTicketStatus(ticket, userId);
  const labels = {
    closed: "بسته شده",
    waiting_for_admin: "در انتظار پاسخ",
    answered: "پاسخ داده شده",
  };
  return labels[status] || "نامشخص";
};

const getTicketStatusColor = (ticket, userId) => {
  const status = getTicketStatus(ticket, userId);
  const colors = {
    closed: "#e55039",
    answered: "#28a745",
    waiting_for_admin: "#ffc107",
  };
  return colors[status] || "#999";
};

const getRequestTypeLabel = (sessionType) => {
  const labels = {
    survey: "نقشه‌برداری",
    expert: "کارشناسی",
    execution: "اجرا",
    registration: "اخذ سند",
    supervision: "نظارت",
    general: "عمومی",
  };
  return labels[sessionType] || "نامشخص";
};

export default function Dashboard() {
  const { userProfile } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState({ results: [], stats: {} });
  const [tickets, setTickets] = useState({ results: [] });
  const [allTickets, setAllTickets] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    Promise.all([
      fetchProjects(),
      fetchUserRequests(),
      fetchTicketSessions({ page_size: 5, ordering: "-updated_at" }),
      fetchTicketSessions({ ordering: "-updated_at" }),
    ])
      .then(
        ([projectsData, requestsData, recentTicketsData, allTicketsData]) => {
          console.log("Projects:", projectsData);
          console.log("Requests:", requestsData);
          console.log("Recent tickets:", recentTicketsData);
          console.log("All tickets:", allTicketsData);

          // مدیریت پروژه‌ها
          setProjects(
            Array.isArray(projectsData.results)
              ? projectsData.results
              : Array.isArray(projectsData)
              ? projectsData
              : []
          );

          // مدیریت درخواست‌ها
          setRequests({
            results: Array.isArray(requestsData.results)
              ? requestsData.results
              : [],
            stats: requestsData.stats || {},
          });

          // مدیریت تیکت‌های اخیر
          setTickets({
            results: Array.isArray(recentTicketsData.results?.results)
              ? recentTicketsData.results.results
              : [],
          });

          // مدیریت همه تیکت‌ها
          setAllTickets({
            results: Array.isArray(allTicketsData.results?.results)
              ? allTicketsData.results.results
              : [],
          });

          setLoading(false);
        }
      )
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(err.message || "خطا در دریافت داده‌ها");
        setLoading(false);
      });
  }, []);

  const handleTicketClick = (ticket) => {
    if (isMobile) {
      console.log("Opening modal for ticket:", ticket.id);
      setSelectedTicket(ticket);
    }
  };

  if (loading) return <p className="text-center py-8">در حال بارگذاری...</p>;
  if (error)
    return <p className="text-center text-red-500 py-8">خطا: {error}</p>;

  return (
    <div className="font-vazir page-content text-gray-800 bg-gray-50 p-5">
      <WelcomeCard />
      <ProjectInfoCard
        requests={requests}
        projects={projects}
        tickets={allTickets.results}
        userId={userProfile?.id}
      />
      <SectionGrid
        recentRequests={
          Array.isArray(requests.results) ? requests.results.slice(0, 5) : []
        }
        recentTickets={
          Array.isArray(tickets.results) ? tickets.results.slice(0, 5) : []
        }
        requestsData={Array.isArray(requests.results) ? requests.results : []}
        userId={userProfile?.id}
        onTicketClick={handleTicketClick}
        isMobile={isMobile}
      />
      {selectedTicket && isMobile && (
        <TicketModal
          session={selectedTicket}
          onClose={() => {
            console.log("Closing modal for ticket:", selectedTicket.id);
            setSelectedTicket(null);
          }}
          onSendMessage={async (msg, files) => {
            try {
              console.log("Sending message for ticket:", selectedTicket.id);
              await sendTicketMessage(selectedTicket.id, {
                message: msg,
                attachments: files,
              });
              const response = await fetchTicketSessions({
                id: selectedTicket.id,
              });
              const updatedSession = response.results?.results?.[0];
              if (updatedSession) {
                setSelectedTicket(updatedSession);
                setTickets((prev) => ({
                  ...prev,
                  results: prev.results.map((t) =>
                    t.id === updatedSession.id ? updatedSession : t
                  ),
                }));
              }
            } catch (error) {
              console.error("خطا در ارسال پیام:", error);
              throw error;
            }
          }}
          onPreview={() => {}}
        />
      )}
    </div>
  );
}

function ProjectInfoCard({
  requests = { results: [], stats: {} },
  projects = [],
  tickets = [],
  userId,
}) {
  const [openAccordion, setOpenAccordion] = useState(null);
  const navigate = useNavigate();
  const statusCounts = requests.stats || {};
  const statusList = [
    {
      key: "all",
      label: "کل درخواست‌ها",
      color: "#2563eb",
      icon: <FaClipboardList size={24} />,
      link: "/requests",
      value: statusCounts.total || 0,
    },
    {
      key: "pending",
      label: "در حال بررسی",
      color: "#f1c40f",
      icon: <FaHourglassHalf size={24} />,
      link: "/requests?status=pending",
      value: statusCounts.pending || 0,
    },
    {
      key: "in_progress",
      label: "در حال انجام",
      color: "#1abc9c",
      icon: <IoMdSettings size={24} />,
      link: "/requests?status=in_progress",
      value: statusCounts.in_progress || 0,
    },
    {
      key: "completed",
      label: "تکمیل شده",
      color: "#28a745",
      icon: <FaCheckCircle size={24} />,
      link: "/requests?status=completed",
      value: statusCounts.completed || 0,
    },
    {
      key: "incomplete",
      label: "دارای نقص",
      color: "#e67e22",
      icon: <FaExclamationCircle size={24} />,
      link: "/requests?status=incomplete",
      value: statusCounts.incomplete || 0,
    },
    {
      key: "rejected",
      label: "رد شده",
      color: "#dc3545",
      icon: <IoIosCloseCircleOutline size={24} />,
      link: "/requests?status=rejected",
      value: statusCounts.rejected || 0,
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
      value: tickets.filter((t) => getTicketStatus(t, userId) === "answered")
        .length,
    },
    {
      key: "waiting_for_admin",
      label: "در انتظار پاسخ",
      color: "#ffc107",
      icon: <FaHourglassHalf size={24} />,
      link: "/tickets?status=waiting_for_admin",
      value: tickets.filter(
        (t) => getTicketStatus(t, userId) === "waiting_for_admin"
      ).length,
    },
    {
      key: "closed",
      label: "بسته شده",
      color: "#e55039",
      icon: <IoIosCloseCircleOutline size={24} />,
      link: "/tickets?status=closed",
      value: tickets.filter((t) => getTicketStatus(t, userId) === "closed")
        .length,
    },
  ].filter((item) => item.value > 0);

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

function SectionGrid({
  recentRequests = [],
  recentTickets = [],
  requestsData = [],
  userId,
  onTicketClick,
  isMobile,
}) {
  const [openSections, setOpenSections] = useState({
    requests: true,
    tickets: true,
  });
  const navigate = useNavigate();

  const handleTicketNavigation = (ticketId) => {
    console.log("Navigating to ticket ID:", ticketId);
    if (isMobile) {
      const ticket = recentTickets.find((t) => t.id === ticketId);
      if (ticket) {
        console.log("Opening modal for ticket:", ticketId);
        onTicketClick(ticket);
      }
    } else {
      const ticketUrl = `/tickets/session/${ticketId}`;
      console.log("Navigating to URL:", ticketUrl);
      navigate(ticketUrl);
    }
  };

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
          <div
            key={req.id}
            onClick={() => {
              console.log("Navigating to request:", req.id);
              navigate(`/requests/${req.id}`);
            }}
            className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-orange-50 hover:rounded-md transition-colors section-item"
          >
            <div className="flex flex-col flex-grow">
              <span className="font-medium">{req.project_title}</span>
              <span className="text-xs text-gray-500 mt-1">
                {getRequestTypeLabel(req.request_type)}
              </span>
            </div>
            <span
              className="px-2 py-1 rounded-lg text-xs font-bold text-white text-center min-w-[90px]"
              style={{ backgroundColor: getStatusColor(req.status) }}
            >
              {getStatusLabel(req.status)}
            </span>
          </div>
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
        {recentTickets.map((ticket) => {
          const relatedRequest = requestsData.find(
            (req) => req.id === ticket.related_request_id
          );
          return (
            <div
              key={ticket.id}
              onClick={() => handleTicketNavigation(ticket.id)}
              className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-orange-50 hover:rounded-md transition-colors section-item"
            >
              <div className="flex flex-col flex-grow">
                <span className="font-medium">{ticket.title}</span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                </span>
                <span className="text-xs text-gray-600 mt-1">
                  {ticket.related_request_id &&
                  ticket.session_type !== "general" ? (
                    <>
                      مرتبط با:{" "}
                      {relatedRequest?.project_title || "درخواست نامشخص"} (
                      {getRequestTypeLabel(ticket.session_type)})
                      <br />
                      <a
                        href={`/requests/${ticket.related_request_id}`}
                        className="text-orange-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        مشاهده درخواست
                      </a>
                    </>
                  ) : (
                    "تیکت عمومی"
                  )}
                </span>
              </div>
              <span
                className="px-2 py-1 rounded-lg text-xs font-bold text-white text-center min-w-[90px]"
                style={{
                  backgroundColor: getTicketStatusColor(ticket, userId),
                }}
              >
                {getTicketStatusLabel(ticket, userId)}
              </span>
            </div>
          );
        })}
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
    <div className="bg-white rounded-xl shadow p-4 border border-blue-100 flex-1 min-w-[300px] section-container">
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
          <a
            href={linkHref}
            className="text-orange-500 text-sm hover:underline"
          >
            {linkText}
          </a>
        </div>
      )}
      <style>
        {`
        .section-container {
          min-height: 300px;
        }
        .section-item {
          min-height: 70px;
          display: flex;
          align-items: center;
        }
        `}
      </style>
    </div>
  );
}
