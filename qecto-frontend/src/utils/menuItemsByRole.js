// src/config/navbarLinksByRole.js

const navbarLinksByRole = {
  guest: [
    { to: "/", label: "خانه" },
    { to: "/about", label: "درباره ما" },
    { to: "/contact", label: "تماس با ما" },
    { to: "/request", label: "درخواست نقشه‌برداری" },
  ],
  user: [{ to: "/dashboard", label: "داشبورد" }],
  admin: [{ to: "/admin-panel", label: "پنل ادمین" }],
  superadmin: [{ to: "/super-admin-panel", label: "پنل ابرادمین" }],
};

export default navbarLinksByRole;
