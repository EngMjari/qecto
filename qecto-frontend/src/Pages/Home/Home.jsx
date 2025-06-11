import React from "react";
import StatsSection from "./StatsSection";
import { Link } from "react-router-dom";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
import { motion } from "framer-motion";

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
    <div className="animate-fade-in page-content" dir="rtl">
      {/* Hero Section */}
      <section className="relative text-white bg-gradient-to-br from-teal-800 to-teal-900 h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDMzNTMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiPnt7c2l0ZUNvbmZpZy5zaXRlX25hbWV9fTwvdGV4dD48L3N2Zz4=')] bg-cover bg-center"></div>

        <div className="relative container px-4 sm:px-6 text-center max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 drop-shadow-lg"
          >
            {siteConfig?.site_name || "بدون نام"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl lg:text-2xl mb-8 font-light max-w-3xl mx-auto drop-shadow"
          >
            {siteConfig?.description ||
              "ما با ارائه خدمات مهندسی و مشاوره، به شما در تحقق پروژه‌های عمرانی و ثبتی کمک می‌کنیم."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/contact">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95">
                با ما تماس بگیرید
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <StatsSection />

      {/* Services Section */}
      <section
        id="services"
        className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-gray-800"
            >
              خدمات ما
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "6rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 h-1.5 bg-orange-500 mx-auto rounded-full"
            ></motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-gray-600 mt-6 max-w-2xl mx-auto"
            >
              ما با بهره‌گیری از دانش روز و تیم مجرب، آماده ارائه بهترین خدمات
              مهندسی به شما هستیم.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 group"
              >
                <div className="text-5xl mb-5 flex justify-center items-center h-16 transition-transform duration-300 group-hover:scale-110">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-teal-700 to-teal-800">
        <div className="container px-4 sm:px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              آماده ثبت درخواست خود هستید؟
            </h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              با ثبت درخواست، پروژه‌های خود را به دست تیم حرفه‌ای ما بسپارید و
              از کیفیت و سرعت خدمات ما بهره‌مند شوید.
            </p>
            <Link to="/request">
              <button className="bg-white text-teal-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95">
                ثبت درخواست
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
