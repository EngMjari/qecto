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
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import WelcomeCard from "./WelcomeCard";
import { IoIosCloseCircleOutline, IoMdSettings } from "react-icons/io";
import { fetchAllData } from "../../api/projectsApi";

// تابع تعیین رنگ وضعیت
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#f1c40f"; // در حال بررسی
    case "in_progress":
      return "#1abc9c"; // در حال انجام
    case "completed":
      return "#28a745"; // تکمیل شده
    case "incomplete":
      return "#e67e22"; // دارای نقص
    case "rejected":
      return "#dc3545"; // رد شده
    default:
      return "#999"; // ناشناخته
  }
};

// تابع برچسب فارسی وضعیت
const getStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "در حال بررسی";
    case "in_progress":
      return "در حال انجام";
    case "completed":
      return "تکمیل شده";
    case "incomplete":
      return "دارای نقص";
    case "rejected":
      return "رد شده";
    default:
      return "نامشخص";
  }
};
const getTicketStatusLabel = (status) => {
  switch (status) {
    case "waiting_for_admin":
      return "در انتظار پاسخ";
    case "answered":
      return "پاسخ داده شده";
    default:
      return "نامشخص";
  }
};

const getTicketStatusColor = (status) => {
  switch (status) {
    case "answered":
      return "#28a745";
    case "waiting_for_admin":
      return "#ffc107";
    default:
      return "#999";
  }
};

const recentTickets = [
  {
    id: 1,
    title: "پیگیری پروژه X",
    status: "پاسخ داده شده",
    statusColor: "#28a745",
  },
  {
    id: 2,
    title: "سوال در مورد هزینه",
    status: "منتظر پاسخ",
    statusColor: "#ffc107",
  },
  {
    id: 3,
    title: "مشکل در آپلود فایل‌ها",
    status: "بسته شده",
    statusColor: "#6c757d",
  },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData()
      .then((response) => {
        setData(response.data); // داده‌های برگشتی از API رو ذخیره کن
        setLoading(false);
        console.log("Data : ", response.data);
      })
      .catch((err) => {
        setError(err.message || "خطا در دریافت داده‌ها");
        setLoading(false);
      });
  }, []);
  if (loading) return <p>در حال بارگذاری...</p>;
  if (error) return <p>خطا: {error}</p>;
  return (
    <div style={styles.container}>
      <WelcomeCard />
      <ProjectInfoCard
        requests={data.requests.length}
        user={data.user}
        requestsList={data.requests}
        projects={data.projects}
        tickets={data.latest_messages || []}
      />
      {/* <StatsGrid projects={data.projects} requests={data.requests} /> */}
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

// function StatsGrid({ projects, requests }) {
//   if (!projects) return null;

//   const pending = requests.filter((p) => p.status === "pending").length;
//   const completed = requests.filter((p) => p.status === "completed").length;
//   const in_progress = requests.filter((p) => p.status === "in_progress").length;
//   const rejected = requests.filter((p) => p.status === "rejected").length;
//   const incomplete = requests.filter((p) => p.status === "incomplete").length;

//   const stats = [
//     {
//       icon: <FaHourglassHalf style={styles.spinningIcon} />,
//       title: "درحال بررسی",
//       value: pending,
//       color: "#f1c40f",
//       link: "/requests?status=pending",
//     },
//     {
//       icon: <IoMdSettings style={styles.spinningIcon} />,
//       title: "در حال انجام",
//       value: in_progress,
//       color: "#1abc9c",
//       link: "/requests?status=approved",
//     },
//     {
//       icon: <FaCheckCircle />,
//       title: "تکمیل شده",
//       value: completed,
//       color: "#28a745",
//       link: "/requests?status=approved",
//     },
//     {
//       icon: <FaExclamationCircle />,
//       title: "دارای نقص",
//       value: incomplete,
//       color: "#e67e22",
//       link: "/requests?status=incomplete",
//     },
//     {
//       icon: <IoIosCloseCircleOutline />,
//       title: "رد شده",
//       value: rejected,
//       color: "#dc3545",
//       link: "/requests?status=incomplete",
//     },
//   ];

//   return (
//     <>
//       <div></div>
//       <div style={styles.statsGrid}>
//         {stats
//           .filter(({ value }) => value > 0)
//           .map(({ icon, title, value, color, link }) => (
//             <StatCard
//               key={title}
//               icon={icon}
//               title={title}
//               value={value}
//               color={color}
//               link={link}
//             />
//           ))}
//       </div>
//       {/* متن مجموع پروژه‌ها */}
//     </>
//   );
// }

function ProjectInfoCard({
  requests,
  user,
  requestsList = [],
  projects = [],
  tickets = [],
}) {
  const [openAccordion, setOpenAccordion] = useState(null);
  const navigate = useNavigate();

  // پروژه‌ها
  const totalProjects = projects.length;

  // درخواست‌ها
  const totalRequests = requestsList.length;
  const statusList = [
    {
      key: "all",
      label: "کل درخواست‌ها",
      color: "#2563eb",
      icon: <FaClipboardList size={24} />,
      link: "/requests",
      value: totalRequests,
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

  // تیکت‌ها
  const answeredTickets = (tickets || []).filter(
    (t) => t.session?.reply_status === "answered"
  ).length;
  const waitingTickets = (tickets || []).filter(
    (t) => t.session?.reply_status === "waiting_for_admin"
  ).length;
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
      value: answeredTickets,
    },
    {
      key: "waiting_for_admin",
      label: "در انتظار پاسخ",
      color: "#ffc107",
      icon: <FaHourglassHalf size={24} />,
      link: "/tickets?status=waiting_for_admin",
      value: waitingTickets,
    },
  ];

  // آکاردئون هندلر
  const handleAccordion = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  // انیمیشن آیکون‌ها
  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.13, rotate: 6 },
    tap: { scale: 0.97, rotate: -6 },
    active: { scale: 1.18, rotate: 0 },
  };

  return (
    <div
      style={{
        background: "linear-gradient(120deg, #e0e7ff 0%, #fff 100%)",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(80, 120, 255, 0.10)",
        padding: "32px 24px 18px 24px",
        marginBottom: 32,
        border: "1px solid #e0e7ff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)",
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
            }}
          >
            <FaClipboardList size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: "bold", fontSize: 18, color: "#1e293b" }}>
            وضعیت کارتابل
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* پروژه‌ها */}
          <button
            className={`flex flex-col items-center px-2 py-1 rounded-lg transition font-bold ${
              openAccordion === "projects"
                ? "bg-blue-100 text-blue-700 scale-110 shadow"
                : "text-gray-500 opacity-80 hover:bg-blue-50"
            }`}
            onClick={() =>
              setOpenAccordion(openAccordion === "projects" ? null : "projects")
            }
            style={{
              minWidth: 60,
              background:
                openAccordion === "projects" ? "#e0e7ff" : "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <motion.span
              variants={iconVariants}
              animate={openAccordion === "projects" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                boxShadow:
                  openAccordion === "projects" ? "0 0 0 3px #a5b4fc55" : "none",
                marginBottom: 2,
              }}
            >
              <FaProjectDiagram size={18} color="#2563eb" />
            </motion.span>
            <span style={{ fontSize: 11, marginTop: 1 }}>پروژه‌ها</span>
          </button>
          {/* درخواست‌ها */}
          <button
            className={`flex flex-col items-center px-2 py-1 rounded-lg transition font-bold ${
              openAccordion === "requests"
                ? "bg-blue-100 text-blue-700 scale-110 shadow"
                : "text-gray-500 opacity-80 hover:bg-blue-50"
            }`}
            onClick={() =>
              setOpenAccordion(openAccordion === "requests" ? null : "requests")
            }
            style={{
              minWidth: 60,
              background:
                openAccordion === "requests" ? "#e0e7ff" : "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <motion.span
              variants={iconVariants}
              animate={openAccordion === "requests" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                boxShadow:
                  openAccordion === "requests" ? "0 0 0 3px #a5b4fc55" : "none",
                marginBottom: 2,
              }}
            >
              <FaClipboardList size={18} color="#1e293b" />
            </motion.span>
            <span style={{ fontSize: 11, marginTop: 1 }}>درخواست‌ها</span>
          </button>
          {/* تیکت‌ها */}
          <button
            className={`flex flex-col items-center px-2 py-1 rounded-lg transition font-bold ${
              openAccordion === "tickets"
                ? "bg-blue-100 text-blue-700 scale-110 shadow"
                : "text-gray-500 opacity-80 hover:bg-blue-50"
            }`}
            onClick={() =>
              setOpenAccordion(openAccordion === "tickets" ? null : "tickets")
            }
            style={{
              minWidth: 60,
              background:
                openAccordion === "tickets" ? "#e0e7ff" : "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <motion.span
              variants={iconVariants}
              animate={openAccordion === "tickets" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                boxShadow:
                  openAccordion === "tickets" ? "0 0 0 3px #a5b4fc55" : "none",
                marginBottom: 2,
              }}
            >
              <FaEnvelopeOpenText size={18} color="#f59e42" />
            </motion.span>
            <span style={{ fontSize: 11, marginTop: 1 }}>تیکت‌ها</span>
          </button>
        </div>
      </div>
      {/* سرتیترها */}

      {/* آکاردئون آمار */}
      <div className="transition-all duration-300 mt-4">
        {/* پروژه‌ها */}
        {openAccordion === "projects" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 cursor-pointer"
              onClick={() => navigate("/projects")}
              style={{ transition: "background 0.2s" }}
            >
              <FaProjectDiagram size={24} color="#2563eb" />
              <span className="font-medium text-gray-700">کل پروژه‌ها</span>
              <span className="px-3 py-1 rounded-lg font-bold bg-blue-100 text-blue-700 ml-auto">
                {projects.length}
              </span>
            </motion.div>
          </div>
        )}
        {/* درخواست‌ها */}
        {openAccordion === "requests" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {statusList.map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 cursor-pointer"
                onClick={() => navigate(item.link)}
                style={{ transition: "background 0.2s" }}
              >
                {item.icon}
                <span className="font-medium text-gray-700">{item.label}</span>
                <span
                  className="px-3 py-1 rounded-lg font-bold ml-auto"
                  style={{
                    background: item.color + "22",
                    color: item.color,
                    minWidth: 36,
                    textAlign: "center",
                  }}
                >
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        )}
        {/* تیکت‌ها */}
        {openAccordion === "tickets" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ticketStats.map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 cursor-pointer"
                onClick={() => navigate(item.link)}
                style={{ transition: "background 0.2s" }}
              >
                {item.icon}
                <span className="font-medium text-gray-700">{item.label}</span>
                <span
                  className="px-3 py-1 rounded-lg font-bold ml-auto"
                  style={{
                    background: item.color + "22",
                    color: item.color,
                    minWidth: 36,
                    textAlign: "center",
                  }}
                >
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// function StatCard({ icon, title, value, color, link }) {
//   return (
//     <motion.a
//       href={link}
//       whileHover={{ scale: 1.05 }}
//       style={{ ...styles.statCard, borderRight: `5px solid ${color}` }}
//     >
//       <div style={{ fontSize: "2rem", color }}>{icon}</div>
//       <div>
//         <h4 style={{ margin: "10px 0 5px", fontWeight: "bold" }}>{title}</h4>
//         <p style={{ fontSize: "1.2rem", color }}>{value}</p>
//       </div>
//     </motion.a>
//   );
// }

function SectionGrid({ recentRequests = [], recentTickets = [] }) {
  const [openSections, setOpenSections] = useState({
    requests: false,
    tickets: false,
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "40px",
      }}
    >
      <div style={{ flex: 1, minWidth: 320 }}>
        <DashboardSection
          title="آخرین درخواست‌ها"
          linkText="همه درخواست‌ها"
          linkHref="/requests"
          open={openSections.requests}
          onToggle={() =>
            setOpenSections((prev) => ({
              ...prev,
              requests: !prev.requests,
            }))
          }
        >
          {(recentRequests || []).map((req) => (
            <Link
              key={req.id}
              to={`/projects/${req.project.id}`}
              style={styles.itemRow}
              className="hoverItem"
            >
              <div style={styles.itemColumn}>
                <span>{req.project.title}</span>
                <span style={styles.requestType}>
                  {req.request_type === "survey" && "نقشه‌برداری"}
                  {req.request_type === "expert" && "کارشناسی"}
                </span>
              </div>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(req.status),
                }}
              >
                {getStatusLabel(req.status)}
              </span>
            </Link>
          ))}
        </DashboardSection>
      </div>
      <div style={{ flex: 1, minWidth: 320 }}>
        <DashboardSection
          title="آخرین تیکت‌ها"
          linkText="همه تیکت‌ها"
          linkHref="/tickets"
          open={openSections.tickets}
          onToggle={() =>
            setOpenSections((prev) => ({
              ...prev,
              tickets: !prev.tickets,
            }))
          }
        >
          {(recentTickets || []).map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/session/${ticket.session.id}`}
              style={styles.itemRow}
              className="hoverItem"
            >
              <div style={styles.itemColumn}>
                <span>{ticket.session.title}</span>
                <span style={styles.requestType}>&nbsp;</span>{" "}
                {/* برای تراز ارتفاع */}
              </div>
              <span
                style={{
                  ...styles.statusBadge,
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
  defaultOpen = false,
  open,
  onToggle,
  linkText,
  linkHref,
}) {
  // حذف state داخلی و استفاده از prop open
  return (
    <div className="mb-6 bg-white rounded-xl shadow p-4 border border-blue-100">
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
          <Link to={linkHref} style={styles.sectionLink}>
            {linkText}
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  projectInfo: {
    borderRadius: "12px 12px 0 0",
  },
  spinningIcon: {
    animation: "spin 2s linear infinite",
  },
  container: {
    padding: "10px 20px",
    fontFamily: "'Vazir', sans-serif",
    color: "#002a3a",
    backgroundColor: "#f5f5f5",
  },
  profileAlert: {
    backgroundColor: "#fff8e1",
    color: "#856404",
    padding: "12px 20px",
    borderRadius: "8px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  editLink: {
    color: "#ff5700",
    marginRight: 5,
    textDecoration: "underline",
  },
  // statsGrid: {
  //   display: "grid",
  //   gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  //   gap: "15px",
  //   marginBottom: "25px",
  // },
  statCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 6px 15px rgba(0, 42, 58, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    textDecoration: "none",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  alertBox: {
    backgroundColor: "#fff3f3",
    color: "#dc3545",
    padding: "15px 20px",
    borderRadius: "8px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 6px 15px rgba(0, 42, 58, 0.1)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    alignItems: "center",
  },
  sectionLink: {
    color: "#ff5700",
    fontSize: "0.9rem",
    textDecoration: "none",
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
    transition: "background-color 0.3s ease",
    cursor: "pointer",
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
    whiteSpace: "nowrap",
  },
  itemColumn: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  requestType: {
    fontSize: "0.85rem",
    color: "#666",
    marginTop: "4px",
  },
};

// استایل برای هاور روی آیتم‌ها (می‌تونی این رو به CSS اضافه کنی یا با styled-components یا emotion استفاده کنی)
const styleSheet = `
.hoverItem:hover {
  background-color: rgba(255,87,0,.1);
  border-radius: 6px;
}
`;

// اضافه کردن استایل هاور به داکیومنت (می‌تونی این رو در کامپوننت اصلی استفاده کنی)
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styleSheet;
  document.head.appendChild(styleTag);
}
