// Contexts/SiteConfigContext.js :
import React, { createContext, useEffect, useState, useCallback } from "react";
import { fetchSiteConfig } from "../api";
import defaultLogo from "../assets/images/logo.png"; // لوگوی پیش‌فرض

export const SiteConfigContext = createContext();

export const SiteConfigProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تابع fetch با قابلیت retry
  const loadSiteConfig = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchSiteConfig()
      .then((res) => {
        if (res) {
          setSiteConfig(res);
          setError(null);
        } else {
          setSiteConfig(null);
          setError("داده‌ای دریافت نشد.");
        }
      })
      .catch((err) => {
        setSiteConfig(null);
        setError(err.message || "خطا در بارگذاری سایت");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadSiteConfig();
  }, [loadSiteConfig]);

  return (
    <SiteConfigContext.Provider
      value={{ siteConfig, loading, error, retry: loadSiteConfig, defaultLogo }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};
