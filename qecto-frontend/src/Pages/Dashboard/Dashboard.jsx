import React, { useEffect, useState } from "react";
import { FaClipboardList, FaCheckCircle, FaExclamationCircle, FaHourglassHalf } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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

const getTicketStatusColor = (status) => {
  switch (status) {
    case "پاسخ داده شده":
      return "#28a745";
    case "منتظر پاسخ":
      return "#ffc107";
    case "بسته شده":
      return "#6c757d";
    default:
      return "#999";
  }
};

const recentTickets = [
  { id: 1, title: "پیگیری پروژه X", status: "پاسخ داده شده", statusColor: "#28a745" },
  { id: 2, title: "سوال در مورد هزینه", status: "منتظر پاسخ", statusColor: "#ffc107" },
  { id: 3, title: "مشکل در آپلود فایل‌ها", status: "بسته شده", statusColor: "#6c757d" },
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
      <ProjectInfoCard requests={data.requests.length} user={data.user} />
      <StatsGrid projects={data.projects} requests={data.requests} />
      <SectionGrid
        recentRequests={Array.isArray(data?.latest_requests) ? data.latest_requests : []}
        recentTickets={Array.isArray(data?.latest_messages) ? data.latest_messages : []}
      />
    </div>
  );
}

function StatsGrid({ projects, requests }) {
  if (!projects) return null;

  const pending = requests.filter((p) => p.status === "pending").length;
  const completed = requests.filter((p) => p.status === "completed").length;
  const in_progress = requests.filter((p) => p.status === "in_progress").length;
  const rejected = requests.filter((p) => p.status === "rejected").length;
  const incomplete = requests.filter((p) => p.status === "incomplete").length;

  const stats = [
    {
      icon: <FaHourglassHalf style={styles.spinningIcon} />,
      title: "درحال بررسی",
      value: pending,
      color: "#f1c40f",
      link: "/requests?status=pending",
    },
    {
      icon: <IoMdSettings style={styles.spinningIcon} />,
      title: "در حال انجام",
      value: in_progress,
      color: "#1abc9c",
      link: "/requests?status=approved",
    },
    { icon: <FaCheckCircle />, title: "تکمیل شده", value: completed, color: "#28a745", link: "/requests?status=approved" },
    { icon: <FaExclamationCircle />, title: "دارای نقص", value: incomplete, color: "#e67e22", link: "/requests?status=incomplete" },
    { icon: <IoIosCloseCircleOutline />, title: "رد شده", value: rejected, color: "#dc3545", link: "/requests?status=incomplete" },
  ];

  return (
    <>
      <div></div>
      <div style={styles.statsGrid}>
        {stats
          .filter(({ value }) => value > 0)
          .map(({ icon, title, value, color, link }) => (
            <StatCard key={title} icon={icon} title={title} value={value} color={color} link={link} />
          ))}
      </div>
      {/* متن مجموع پروژه‌ها */}
    </>
  );
}

function ProjectInfoCard({ requests, user }) {
  if (!requests) return null;
  return (
    <div className="bg-white shadow rounded-4 border-dark">
      {/* Left Section: Icon and Title */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4 sm:mb-0 flex-shrink-0">
        <div className="p-3 bg-dark" style={styles.projectInfo}>
          <FaClipboardList size={24} className="text-white" /> {/* Slightly smaller icon for horizontal layout */}
        </div>
        <h2 className="text-md text-center md:text-xl font-semibold whitespace-nowrap py-2" style={{ color: "#002a3a" }}>
          وضعیت کارتابل
        </h2>
      </div>

      {/* Middle Section: Greeting and Count - takes available space */}
      <div className="sm:text-right h5 rtl:sm:text-left mb-4 sm:mb-0 sm:mx-4 flex-grow px-4 py-2">
        <p className="text-sm md:text-base text-gray-700">
          سلام{" "}
          <span className="font-semibold" style={{ color: "#002a3a" }}>
            {user.full_name}
          </span>
          ، تعداد درخواست های شما{" "}
          <span className="font-bold text-base md:text-lg" style={{ color: "#002a3a" }}>
            {requests}
          </span>{" "}
          عدد می‌باشد.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, link }) {
  return (
    <motion.a href={link} whileHover={{ scale: 1.05 }} style={{ ...styles.statCard, borderRight: `5px solid ${color}` }}>
      <div style={{ fontSize: "2rem", color }}>{icon}</div>
      <div>
        <h4 style={{ margin: "10px 0 5px", fontWeight: "bold" }}>{title}</h4>
        <p style={{ fontSize: "1.2rem", color }}>{value}</p>
      </div>
    </motion.a>
  );
}

function SectionGrid({ recentRequests = [], recentTickets = [] }) {
  return (
    <div style={styles.sectionGrid}>
      <DashboardSection title="آخرین درخواست‌ها" linkText="همه درخواست‌ها" linkHref="/projects">
        {(recentRequests || []).map((req) => (
          <Link key={req.id} to={`/projects/${req.project.id}`} style={styles.itemRow} className="hoverItem">
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

      <DashboardSection title="آخرین تیکت‌ها" linkText="همه تیکت‌ها" linkHref="/tickets">
        {(recentTickets || []).map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`} style={styles.itemRow} className="hoverItem">
            <span>{ticket.title}</span>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: getTicketStatusColor(ticket.status),
              }}
            >
              {getStatusLabel(ticket.status)}
            </span>
          </Link>
        ))}
      </DashboardSection>
    </div>
  );
}

function DashboardSection({ title, children, linkText, linkHref }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3>{title}</h3>
        <Link to={linkHref} style={styles.sectionLink}>
          {linkText}
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}

// حذف ActionButtons مطابق درخواست شما

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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },
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
