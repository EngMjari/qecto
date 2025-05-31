import React from "react";
import { Link } from "react-router-dom";
export default function Dashboard() {
  return (
    <div className="container py-5">
      <h2>داشبورد کاربر</h2>
      <p>در این قسمت لیست پروژه‌ها، تیکت‌ها و اطلاعات حساب نمایش داده می‌شود.</p>
      <Link className="h3 text-decoration-none text-danger" to="/request">
        درخواست جدید
      </Link>
    </div>
  );
}
