import React from "react";
import CountUp from "./CountUp";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaUsers,
  FaFileAlt,
  FaProjectDiagram,
  FaChartLine,
  FaTasks,
} from "react-icons/fa";

const statsAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const iconAnimation = {
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 },
};

export default function StatsSection({
  userCount,
  ticketCount,
  completedRequests,
}) {
  const stats = [
    {
      icon: FaBriefcase,
      number: ticketCount,
      label: "تیکت ها",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: FaUsers,
      number: userCount,
      label: "کاربران فعال",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: FaFileAlt,
      number: completedRequests,
      label: "درخواست ثبت شده",
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            دستاوردهای ما
          </h2>
          <div className="mt-4 h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            با سال‌ها تجربه و تخصص، به یکی از معتبرترین ارائه‌دهندگان خدمات
            مهندسی تبدیل شده‌ایم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={statsAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -10 }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  variants={iconAnimation}
                  whileHover="hover"
                  whileTap="tap"
                  className={`bg-gradient-to-br ${stat.color} text-white p-4 rounded-full mb-6`}
                >
                  <stat.icon className="h-8 w-8" />
                </motion.div>

                <p className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">
                  <CountUp end={stat.number} />+
                </p>
                <p className="text-gray-600 font-medium">{stat.label}</p>

                <div className="mt-4 w-16 h-1 bg-gradient-to-r via-orange-500 from-transparent to-transparent rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
