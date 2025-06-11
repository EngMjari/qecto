import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
import { ArrowLeftIcon, LogOutIcon } from "lucide-react";

const MobileTopNav = ({ isLoggedIn, onLogout, logoSrc }) => {
  const { siteConfig } = useContext(SiteConfigContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  // مدیریت تغییر پس‌زمینه با اسکرول
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // تابع برای بازگشت به صفحه قبلی
  const handleBack = () => {
    navigate(-1);
  };

  // تابع برای نمایش پرامپت خروج
  const handleLogoutClick = () => {
    setShowLogoutPrompt(true);
  };

  // تابع برای تأیید خروج
  const confirmLogout = () => {
    setShowLogoutPrompt(false);
    onLogout();
  };

  // تابع برای لغو خروج
  const cancelLogout = () => {
    setShowLogoutPrompt(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 border-b border-gray-300 flex justify-between items-center h-16 px-4 z-50 lg:hidden transition-all duration-300 ${
          isScrolled ? "bg-transparent border-none" : "bg-white"
        }`}
        style={{ direction: "rtl" }}
      >
        {/* لوگو */}
        <div className="flex items-center">
          <div
            className={`p-2 rounded-md shadow-md transition-all duration-300 ${
              isScrolled ? "bg-[#002a3a]" : ""
            }`}
          >
            <img
              src={siteConfig?.logo_url || logoSrc}
              alt="Logo"
              className="h-10 w-auto rounded-md transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3">
          {/* دکمه خروج - فقط وقتی کاربر لاگین کرده نمایش داده می‌شود */}
          {isLoggedIn && (
            <button
              onClick={handleLogoutClick}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isScrolled
                  ? "bg-red-600/90 backdrop-blur-sm text-white"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              aria-label="خروج"
              title="خروج"
            >
              <LogOutIcon className="w-6 h-6" />
            </button>
          )}

          {/* دکمه بازگشت */}
          <button
            onClick={handleBack}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              isScrolled
                ? "bg-gray-200/90 backdrop-blur-sm text-gray-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="بازگشت"
            title="بازگشت به صفحه قبلی"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* پرامپت تأیید خروج */}
      {showLogoutPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
            style={{ direction: "rtl" }}
          >
            <p className="text-lg font-semibold text-gray-800 mb-4">
              آیا مطمئن هستید که می‌خواهید خارج شوید؟
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all duration-300 font-semibold"
              >
                بله، خروج
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all duration-300 font-semibold"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopNav;
