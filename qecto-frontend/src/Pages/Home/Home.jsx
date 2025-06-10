import React from "react";
import StatsSection from "./StatsSection";
import { Link } from "react-router-dom";
import { SiteConfigContext } from "Contexts/SiteConfigContext";

export default function Home() {
  const { siteConfig } = React.useContext(SiteConfigContext);

  const services = [
    {
      icon: "📐",
      title: "نقشه‌برداری دقیق",
      description:
        "خدمات جامع نقشه‌برداری با تجهیزات مدرن برای پروژه‌های عمرانی و ثبتی.",
    },
    {
      icon: "⚖️",
      title: "کارشناسی امور ثبتی",
      description:
        "مشاوره و انجام کلیه امور تفکیک، افراز و تهیه نقشه‌های UTM ثبتی.",
    },
    {
      icon: "🏗️",
      title: "نظارت پروژه",
      description:
        "نظارت دقیق بر اجرای پروژه‌های ساختمانی مطابق با استانداردها و مقررات.",
    },
    {
      icon: "👷",
      title: "اجرای پروژه",
      description:
        "مدیریت و اجرای پروژه‌های عمرانی و ساختمانی با بالاترین کیفیت.",
    },
  ];

  return (
    <div className="animate-fade-in page-content" style={{ direction: "rtl" }}>
      <section className="relative text-white bg-teal-900 h-[60vh] md:h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-4"
            style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.5)" }}
          >
            {siteConfig.site_name || "بدون نام"}
          </h1>
          <p
            className="text-lg md:text-2xl mb-8 font-light max-w-3xl mx-auto"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            {siteConfig.description ||
              "ما با ارائه خدمات مهندسی و مشاوره، به شما در تحقق پروژه‌های عمرانی و ثبتی کمک می‌کنیم."}
          </p>
          <Link to="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg">
              با ما تماس بگیرید
            </button>
          </Link>
        </div>
      </section>

      <StatsSection />

      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              خدمات ما
            </h2>
            <div className="mt-4 h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              ما با بهره‌گیری از دانش روز و تیم مجرب، آماده ارائه بهترین خدمات
              مهندسی به شما هستیم.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center transform hover:-translate-y-2 border-t-4 border-transparent hover:border-orange-500"
              >
                <div className="text-6xl mb-5 flex justify-center items-center h-16">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
