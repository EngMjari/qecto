import React from "react";
import { FaClipboardList, FaCheckCircle, FaExclamationCircle, FaUserEdit, FaTicketAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import WelcomeCard from "./WelcomeCard";

const recentRequests = [
  { id: 1, title: "درخواست ثبت سند", status: "درحال بررسی", statusColor: "#007bff" },
  { id: 2, title: "درخواست کارشناسی", status: "تاکمیل شده", statusColor: "#28a745" },
  { id: 3, title: "درخواست رفع نقص", status: "دارای نقص", statusColor: "#dc3545" },
];

const recentTickets = [
  { id: 1, title: "پیگیری پروژه X", status: "پاسخ داده شده", statusColor: "#28a745" },
  { id: 2, title: "سوال در مورد هزینه", status: "منتظر پاسخ", statusColor: "#ffc107" },
  { id: 3, title: "مشکل در آپلود فایل‌ها", status: "بسته شده", statusColor: "#6c757d" },
];

export default function Dashboard() {
  return (
    <div style={styles.container}>
      <WelcomeCard />
      <StatsGrid />

      <SectionGrid recentRequests={recentRequests} recentTickets={recentTickets} />
    </div>
  );
}

function StatsGrid() {
  const stats = [
    { icon: <FaClipboardList />, title: "کل درخواست‌ها", value: "15", color: "#002a3a", link: "/requests" },
    { icon: <FaCheckCircle />, title: "درحال بررسی", value: "5", color: "#007bff", link: "/requests?status=pending" },
    { icon: <FaCheckCircle />, title: "تکمیل شده", value: "7", color: "#28a745", link: "/requests?status=approved" },
    { icon: <FaExclamationCircle />, title: "دارای نقص", value: "3", color: "#dc3545", link: "/requests?status=incomplete" },
  ];

  return (
    <div style={styles.statsGrid}>
      {stats.map(({ icon, title, value, color, link }) => (
        <StatCard key={title} icon={icon} title={title} value={value} color={color} link={link} />
      ))}
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

function SectionGrid({ recentRequests, recentTickets }) {
  return (
    <div style={styles.sectionGrid}>
      <DashboardSection title="آخرین درخواست‌ها" linkText="همه درخواست‌ها" linkHref="/requests">
        {recentRequests.map((req) => (
          <Link key={req.id} to={`/requests/${req.id}`} style={styles.itemRow} className="hoverItem">
            <span>{req.title}</span>
            <span style={{ ...styles.statusBadge, backgroundColor: req.statusColor }}>{req.status}</span>
          </Link>
        ))}
      </DashboardSection>

      <DashboardSection title="آخرین تیکت‌ها" linkText="همه تیکت‌ها" linkHref="/tickets">
        {recentTickets.map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`} style={styles.itemRow} className="hoverItem">
            <span>{ticket.title}</span>
            <span style={{ ...styles.statusBadge, backgroundColor: ticket.statusColor }}>{ticket.status}</span>
            {/* <FaTicketAlt color="#ff5700" style={{ marginLeft: 5 }} /> */}
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
    padding: "10px",
    borderBottom: "1px solid #eee",
    color: "#002a3a",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
  },
  statusBadge: {
    padding: "2px 10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    color: "#fff",
    fontWeight: "bold",
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
