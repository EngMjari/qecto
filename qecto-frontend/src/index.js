// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import "./Styles/global.css";
import "./Styles/custom.scss";
import { fetchSiteConfig } from "./api";

const root = ReactDOM.createRoot(document.getElementById("root"));

fetchSiteConfig()
  .then((response) => {
    const data = response?.data;
    if (data?.site_name) {
      document.title = data.site_name;
    }

    if (data?.favicon) {
      // حذف favicon قبلی اگر وجود دارد
      const existingIcons = document.querySelectorAll("link[rel~='icon']");
      existingIcons.forEach((icon) => icon.parentNode.removeChild(icon));

      // اضافه کردن favicon جدید
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png"; // یا svg اگر می‌دونی نوعش چیه
      link.href = data.favicon;
      document.head.appendChild(link);
    }
  })
  .catch((error) => {
    console.error("Error fetching site config:", error);
  })
  .finally(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });

reportWebVitals();
