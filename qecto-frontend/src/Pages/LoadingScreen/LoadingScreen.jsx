// src/components/LoadingScreen/LoadingScreen.jsx
import React, { useContext } from "react";
import "./LoadingScreen.scss";
import { SiteConfigContext } from "../../Contexts/SiteConfigContext";
import Logo from "../../assets/images/logo.png";
const LoadingScreen = () => {
  const { siteConfig } = useContext(SiteConfigContext);

  // رنگ‌ها و لوگو را از siteConfig بگیر، اگر نبود رنگ و لوگوی پیش‌فرض بده
  const primaryColor = siteConfig?.primaryColor || "#ff5700";
  const secondaryColor = siteConfig?.secondaryColor || "#002a3a";
  const logoUrl = siteConfig?.logoUrl || Logo; // اگر لوگو نداریم یک لوگوی پیش‌فرض بگذار

  return (
    <div className="loading-screen" style={{ backgroundColor: secondaryColor }}>
      <div className="loading-content">
        <img src={logoUrl} alt="Site Logo" className="loading-logo" />
        <div
          className="loading-spinner"
          style={{
            borderColor: `${primaryColor} transparent ${primaryColor} transparent`,
          }}
        ></div>
        <p className="loading-text" style={{ color: primaryColor }}>
          در حال بارگذاری ...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
