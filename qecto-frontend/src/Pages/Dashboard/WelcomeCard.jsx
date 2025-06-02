import React from "react";
import { FaPlus, FaFolderOpen, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function WelcomeCard() {
  return (
    <div className="card p-4 mb-4 shadow-sm" style={{ borderRadius: 12, color: "#002a3a" }}>
      <h2 className="mb-2" style={{ color: "#ff5700", fontWeight: "bold", fontSize: "1.8rem" }}>
        خوش آمدید!
      </h2>
      <p className="mb-4 text-secondary" style={{ fontSize: "1rem" }}>
        از طریق دکمه‌های زیر می‌توانید سریع شروع کنید.
      </p>
      <div className="d-flex flex-wrap gap-3">
        <Link
          to="/request"
          className="btn btn-outline-danger p-3 d-flex align-items-center justify-content-center"
          style={{ borderRadius: 8, minWidth: 150, flex: "1 1 auto",  }}
        >
          <FaPlus className="ms-2" /> ثبت درخواست جدید
        </Link>
        <Link
          to="/requests"
          className="btn btn-outline-dark p-3 d-flex align-items-center justify-content-center"
          style={{ borderRadius: 8, minWidth: 150, flex: "1 1 auto" }}
        >
          <FaFolderOpen className="ms-2" /> مشاهده پروژه‌ها
        </Link>
        <Link
          to="/tickets/new"
          className="btn btn-outline-primary p-3 d-flex align-items-center justify-content-center"
          style={{ borderRadius: 8, minWidth: 150, flex: "1 1 auto" }}
        >
          <FaEnvelope className="ms-2" /> ارسال تیکت جدید
        </Link>
      </div>
    </div>
  );
}
