// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import "./Styles/global.css";
import "./Styles/custom.scss";
// ایمپورت همه استایل‌ها از یک فایل مرکزی

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
