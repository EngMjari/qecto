import React, { useContext, useState, useEffect } from "react";
import StatsSection from "./StatsSection";
import { Link } from "react-router-dom";
import { SiteConfigContext } from "../../Contexts/SiteConfigContext";
import { motion } from "framer-motion";
import { fetchHomePageConfig } from "../../api";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

export default function Home({ showToast }) {
  const { siteConfig } = useContext(SiteConfigContext);
  const [homePageConfig, setHomePageConfig] = useState({
    header_title: "",
    header_image_url: "",
    services: [],
    user: 0,
    tickets: 0,
    complete_requests: 0,
    request_bgImage_url: "",
    request_bgColor: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchHomePageConfig();
        setHomePageConfig(data || {});
      } catch (error) {
        console.error("خطا در بارگذاری تنظیمات صفحه اصلی:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in page-content" dir="rtl">
      {/* هدر */}
      <section
        className="relative text-white aspect-video md:aspect-auto md:min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${
            homePageConfig.header_image_url ||
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container px-4 sm:px-6 text-center max-w-4xl z-10 py-12 md:py-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 drop-shadow-lg"
          >
            {homePageConfig.header_title || siteConfig?.site_name || "بدون نام"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-xl lg:text-2xl mb-8 font-light max-w-3xl mx-auto drop-shadow"
          >
            {homePageConfig.header_description ||
              siteConfig?.description ||
              "ما با ارائه خدمات مهندسی و مشاوره، به شما در تحقق پروژه‌های عمرانی و ثبتی کمک می‌کنیم."}
          </motion.p>
          <motion.div
            animate={{ opacity: 0.5 }}
            whileHover={{ scale: 1.1, opacity: 0.8 }}
            transition={{ ease: "easeInOut" }}
          >
            <Link to="/contact">
              <button className="bg-white bg-opacity-90 text-orange-700 font-bold py-3 px-8 rounded-xl text-lg border-2 border-orange-500 hover:border-orange-400 shadow-[0_0_10px_rgba(255,165,0,0.8)] hover:shadow-[0_0_15px_rgba(255,165,0,1)] transition-all duration-300 transform active:scale-95">
                با ما تماس بگیرید
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* خدمات ما */}
      <section
        id="services"
        className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-gray-800"
            >
              {homePageConfig.services_title || "خدمات ما"}
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "6rem" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 h-1.5 bg-orange-500 mx-auto rounded-full"
            ></motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-gray-600 mt-6 max-w-2xl mx-auto"
            >
              {homePageConfig.services_description ||
                "ما با بهره‌گیری از دانش روز و تیم مجرب، آماده ارائه بهترین خدمات مهندسی به شما هستیم."}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {homePageConfig.services?.length > 0 ? (
              homePageConfig.services.map((service, index) => (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 group"
                >
                  <div className="text-5xl mb-5 flex justify-center items-center h-16 transition-transform duration-300 group-hover:scale-110">
                    {service.icon || "📐"}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title || "بدون عنوان"}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {service.description || "بدون توضیحات"}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                سرویسی یافت نشد
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ثبت درخواست بین خدمات و آمار */}
      <section
        className="py-16 md:py-20 relative bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed"
        style={{
          backgroundImage: homePageConfig.request_bgImage_url
            ? `url('${homePageConfig.request_bgImage_url}')`
            : !homePageConfig.request_bgColor
            ? `url('https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=1920&q=80')`
            : "none",
          backgroundColor: homePageConfig.request_bgColor || undefined,
        }}
      >
        <div className="absolute inset-0 bg-teal-900 opacity-75"></div>
        <div className="container px-4 sm:px-6 mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              {homePageConfig.request_title || "آماده ثبت درخواست خود هستید؟"}
            </h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              {homePageConfig.request_description ||
                "با ثبت درخواست، پروژه‌های خود را به تیم حرفه‌ای ما بسپارید."}
            </p>
            <Link to="/request">
              <button className="bg-white text-teal-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95">
                ثبت درخواست
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* دستاوردهای ما */}
      <StatsSection
        userCount={homePageConfig.user || 0}
        ticketCount={homePageConfig.tickets || 0}
        completedRequests={homePageConfig.complete_requests || 0}
      />
    </div>
  );
}
