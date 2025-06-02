import React from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
  FaUserEdit,
  FaTicketAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // در صورت استفاده از react-router

const recentRequests = [
  { id: 1, title: "درخواست ثبت سند", status: "درحال بررسی", statusColor: "#007bff" },
  { id: 2, title: "درخواست کارشناسی", status: "تایید شده", statusColor: "#28a745" },
  { id: 3, title: "درخواست رفع نقص", status: "دارای نقص", statusColor: "#dc3545" },
];

const recentTickets = [
  { id: 1, title: "پیگیری پروژه X" },
  { id: 2, title: "سوال در مورد هزینه" },
  { id: 3, title: "مشکل در آپلود فایل‌ها" },
];

export default function Dashboard() {
  const isProfileComplete = false;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>داشبورد کاربر</h1>
      <p style={styles.welcome}>به پنل کاربری خود خوش آمدید!</p>

      {!isProfileComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.profileAlert}
        >
          <FaUserEdit style={{ marginLeft: 8 }} />
          لطفاً <Link to="/profile/edit" style={styles.editLink}>اطلاعات خود</Link> را تکمیل کنید.
        </motion.div>
      )}

      {/* آمار کلی */}
      <div style={styles.statsGrid}>
        <StatCard icon={<FaClipboardList />} title="کل درخواست‌ها" value="15" color="#002a3a" link="/requests" />
        <StatCard icon={<FaCheckCircle />} title="درحال بررسی" value="5" color="#007bff" link="/requests?status=pending" />
        <StatCard icon={<FaCheckCircle />} title="تایید شده" value="7" color="#28a745" link="/requests?status=approved" />
        <StatCard icon={<FaExclamationCircle />} title="دارای نقص" value="3" color="#dc3545" link="/requests?status=incomplete" />
      </div>

      {/* هشدار نقص */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={styles.alertBox}
      >
        <FaExclamationCircle style={{ marginLeft: "10px", color: "#dc3545" }} />
        شما ۳ درخواست دارای نقص دارید. لطفاً برای اصلاح اقدام کنید.
      </motion.div>

      {/* درخواست‌ها و تیکت‌ها */}
      <div style={styles.sectionGrid}>
        <DashboardSection title="آخرین درخواست‌ها" linkText="همه درخواست‌ها" linkHref="/requests">
          {recentRequests.map((req) => (
            <Link key={req.id} to={`/requests/${req.id}`} style={styles.itemRow}>
              <span>{req.title}</span>
              <span style={{ ...styles.statusBadge, backgroundColor: req.statusColor }}>{req.status}</span>
            </Link>
          ))}
        </DashboardSection>

        <DashboardSection title="آخرین تیکت‌ها" linkText="همه تیکت‌ها" linkHref="/tickets">
          {recentTickets.map((ticket) => (
            <Link key={ticket.id} to={`/tickets/${ticket.id}`} style={styles.itemRow}>
              <span>{ticket.title}</span>
              <FaTicketAlt color="#ff5700" />
            </Link>
          ))}
        </DashboardSection>
      </div>

      {/* دکمه‌های ثبت */}
      <div style={styles.buttonGroup}>
        <Link to="/requests/new" style={styles.actionButton}>
          <FaPlus style={{ marginLeft: "8px" }} />
          ثبت درخواست جدید
        </Link>
        <Link to="/tickets/new" style={{ ...styles.actionButton, backgroundColor: "#002a3a" }}>
          <FaPlus style={{ marginLeft: "8px" }} />
          ارسال تیکت جدید
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, link }) {
  return (
    <motion.a
      href={link}
      whileHover={{ scale: 1.05 }}
      style={{ ...styles.statCard, borderRight: `5px solid ${color}` }}
    >
      <div style={{ fontSize: "2rem", color }}>{icon}</div>
      <div>
        <h4 style={{ margin: "10px 0 5px", fontWeight: "bold" }}>{title}</h4>
        <p style={{ fontSize: "1.2rem", color }}>{value}</p>
      </div>
    </motion.a>
  );
}

function DashboardSection({ title, children, linkText, linkHref }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3>{title}</h3>
        <Link to={linkHref} style={styles.sectionLink}>{linkText}</Link>
      </div>
      <div>{children}</div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px 20px",
    fontFamily: "'Vazir', sans-serif",
    color: "#002a3a",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2.2rem",
    marginBottom: "10px",
    color: "#ff5700",
  },
  welcome: {
    fontSize: "1rem",
    marginBottom: "20px",
  },
  profileAlert: {
    backgroundColor: "#fff8e1",
    color: "#856404",
    padding: "12px 20px",
    borderRadius: "8px",
    marginBottom: "25px",
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
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    color: "#002a3a",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  statusBadge: {
    padding: "2px 10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    color: "#fff",
    fontWeight: "bold",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  actionButton: {
    backgroundColor: "#ff5700",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    transition: "background-color 0.3s ease",
  },
};
