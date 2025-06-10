import React from "react";
import CountUp from "./CountUp";

const UsersIcon = ({ c }) => (
  <svg
    className={c}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2z"
    ></path>
  </svg>
);

const BriefcaseIcon = ({ c }) => (
  <svg
    className={c}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    ></path>
  </svg>
);
const DocumentTextIcon = ({ c }) => (
  <svg
    className={c}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    ></path>
  </svg>
);

export default function StatsSection() {
  const stats = [
    { icon: BriefcaseIcon, number: 128, label: "پروژه تکمیل شده" },
    { icon: UsersIcon, number: 340, label: "کاربران فعال" },
    { icon: DocumentTextIcon, number: 1500, label: "درخواست ثبت شده" },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-xl shadow-md border-b-4 border-teal-600"
            >
              <stat.icon c="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <p className="text-4xl font-extrabold text-teal-800">
                <CountUp end={stat.number} />+
              </p>
              <p className="text-gray-600 font-semibold mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
