import React from "react";
import { FaPlus, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import bgImg from "../../assets/images/background.png"; // مسیر را با توجه به ساختار پروژه تنظیم کن

export default function WelcomeCard() {
  return (
    <div className="welcome-card-pattern">
      <h2 className="welcome-title-pattern">خوش آمدید!</h2>
      <p className="welcome-desc-pattern">
        از طریق دکمه‌های زیر می‌توانید سریع شروع کنید.
      </p>
      <div className="welcome-btns-pattern">
        <GlassButton
          to="/request"
          color="#ff5700"
          icon={<FaPlus />}
          text="ثبت درخواست جدید"
        />
        <GlassButton
          to="/tickets/new"
          color="#2563eb"
          icon={<FaEnvelope />}
          text="ارسال تیکت جدید"
        />
      </div>
      <style>
        {`
        .welcome-card-pattern {
          border-radius: 22px;
          background: #fff url('${bgImg}') left/contain no-repeat;
          box-shadow: 0 8px 32px 0 #ff570033, 0 1.5px 8px #2563eb22;
          padding: 38px 32px 30px 32px;
          margin-bottom: 32px;
          color: #002a3a;
          position: relative;
          overflow: hidden;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .welcome-title-pattern {
          color: #ff5700;
          font-weight: bold;
          font-size: 2rem;
          margin-bottom: 10px;
          z-index: 1;
          position: relative;
          text-align: center;
        }
        .welcome-desc-pattern {
          font-size: 1.08rem;
          color: #64748b;
          margin-bottom: 28px;
          z-index: 1;
          position: relative;
          text-align: center;
        }
        .welcome-btns-pattern {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          z-index: 1;
          position: relative;
          justify-content: center;
        }
        @media (max-width: 600px) {
          .welcome-card-pattern {
            padding: 22px 8px 18px 8px;
            min-height: 150px;
          }
          .welcome-title-pattern {
            font-size: 1.3rem;
          }
          .welcome-desc-pattern {
            font-size: 1rem;
          }
          .welcome-btns-pattern {
            flex-direction: column;
            gap: 12px;
            width: 100%;
            align-items: stretch;
          }
        }
        `}
      </style>
    </div>
  );
}

// دکمه شیشه‌ای مدرن
function GlassButton({ to, color, icon, text }) {
  return (
    <Link
      to={to}
      className="glass-btn-simple"
      style={{
        border: `2px solid ${color}`,
        color,
        background: "rgba(255,255,255,0.55)",
        boxShadow: `0 2px 16px ${color}22`,
      }}
    >
      <span className="glass-btn-icon-simple">{icon}</span>
      {text}
      <style>
        {`
        .glass-btn-simple {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: bold;
          font-size: 1.07rem;
          border-radius: 14px;
          padding: 14px 22px;
          min-width: 170px;
          text-decoration: none;
          transition: 
            box-shadow 0.25s, 
            transform 0.18s, 
            background 0.2s, 
            color 0.2s, 
            border-color 0.2s;
          backdrop-filter: blur(2.5px);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          justify-content: center;
        }
        .glass-btn-simple:hover {
          background: ${color}11;
          color: #fff;
          border-color: ${color};
          box-shadow: 0 6px 24px ${color}33;
          transform: translateY(-2px) scale(1.045);
        }
        .glass-btn-icon-simple {
          font-size: 1.25em;
          transition: transform 0.25s cubic-bezier(.4,2,.6,1);
        }
        .glass-btn-simple:hover .glass-btn-icon-simple {
          transform: rotate(-18deg) scale(1.18);
        }
        `}
      </style>
    </Link>
  );
}
