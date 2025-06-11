import React, { useState, useEffect, useRef, useContext } from "react";
import cx from "classnames";
import { LogInIcon, UserIcon, ChevronDownIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LoginModal from "./LoginModal";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
export default function Header({ isAuthenticated, role, logout, navLinks }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { siteConfig } = useContext(SiteConfigContext);

  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
  };

  // بستن منوی کاربر هنگام کلیک بیرون
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // تغییر استایل هنگام اسکرول
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={cx(
        "hidden lg:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-dark opacity-95 shadow-md backdrop-blur-sm"
          : "bg-dark bg-opacity-85"
      )}
      style={{ direction: "rtl", zIndex: 1001 }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center h-20">
        {/* لوگو سمت راست */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center cursor-pointer">
            <img
              src={siteConfig?.logo_url || undefined}
              alt="لوگو ککتوسازهیرکاسب"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* لینک‌های ناوبری */}
        <nav className="flex-grow-0">
          <div className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={link.link}
                className={cx(
                  "py-2 px-4 rounded-md transition-all duration-300 text-sm font-semibold",
                  currentPath === link.link
                    ? isScrolled
                      ? "text-orange-600"
                      : "text-white bg-white/20"
                    : isScrolled
                    ? "text-gray-600 hover:text-orange-500"
                    : "text-gray-200 hover:text-white hover:bg-white/20"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* ورود / پروفایل */}
        <div className="flex-1 flex justify-end">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className={cx(
                  "flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all duration-300",
                  isScrolled
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-white/20 text-white hover:bg-white/40"
                )}
              >
                <LogInIcon className="w-5 h-5" />
                <span>ورود</span>
              </button>
              <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
              />
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={cx(
                  "flex items-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all duration-300",
                  isScrolled
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                <UserIcon className="w-5 h-5" />
                <span>پروفایل</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute top-14 left-0 bg-white shadow-md rounded-md w-48 py-2 z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    داشبورد من
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
