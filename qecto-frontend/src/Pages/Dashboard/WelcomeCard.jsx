import React from "react";
import { FaPlus, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import bgImg from "../../assets/images/background.png";

export default function WelcomeCard() {
  return (
    <div
      className="relative flex flex-col items-center rounded-3xl bg-white bg-left bg-no-repeat bg-contain shadow-[0_8px_32px_rgba(255,87,0,0.2),0_1.5px_8px_rgba(37,99,235,0.13)] p-8 sm:p-10 mb-8 min-h-[220px] overflow-hidden text-gray-900"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-orange-500 mb-2 z-10">
        خوش آمدید!
      </h2>
      <p className="text-center text-base sm:text-lg text-gray-500 mb-6 z-10">
        از طریق دکمه‌های زیر می‌توانید سریع شروع کنید.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto justify-center z-10">
        <GlassButton
          to="/request"
          color="orange"
          icon={<FaPlus />}
          text="ثبت درخواست جدید"
        />
        <GlassButton
          to="/tickets/new"
          color="blue"
          icon={<FaEnvelope />}
          text="ارسال تیکت جدید"
        />
      </div>
    </div>
  );
}

function GlassButton({ to, color, icon, text }) {
  const colorClasses = {
    orange:
      "border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-gray-700",
    blue: "border-blue-600 text-blue-600 hover:bg-blue-600/10 hover:text-gray-700",
  };

  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-2 font-bold text-base sm:text-lg border-2 rounded-xl px-5 py-3 min-w-[170px] bg-white/55 shadow-[0_2px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 ease-in-out hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:scale-105 ${colorClasses[color]}`}
    >
      <span className="text-xl transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-125">
        {icon}
      </span>
      {text}
    </Link>
  );
}
