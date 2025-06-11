import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { siteInfo, footerLinks } from "../../config/siteConfig";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
const Footer = () => {
  const { siteConfig } = useContext(SiteConfigContext);
  const location = useLocation();

  return (
    <footer
      className="bg-gray-800 text-white mt-auto"
      style={{ direction: "rtl" }}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          {/* اطلاعات سایت */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {siteConfig?.site_name || "اسم سایت"}
            </h3>
            <p className="text-gray-400 text-wrap text-justify">
              {siteConfig?.description}
            </p>
          </div>

          {/* لینک‌ها */}
          <div>
            <h3 className="text-lg font-bold mb-4">لینک‌های سریع</h3>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => {
                const isActive = location.pathname === link.href;
                return (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className={`transition-colors ${
                        isActive
                          ? "text-orange-400 font-semibold"
                          : "text-gray-400 hover:text-orange-400"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* تماس با ما */}
          <div>
            <h3 className="text-lg font-bold mb-4">تماس با ما</h3>
            <ul className="text-gray-400 space-y-2">
              <li className="text-wrap">{siteConfig?.address}</li>
              <li>تلفن: {siteConfig?.phone}</li>
              <li>ایمیل: {siteConfig?.email}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <Link className="text-reset" to={"/"}>
              {siteConfig?.site_name || "اسم سایت"}
            </Link>
            . تمام حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
