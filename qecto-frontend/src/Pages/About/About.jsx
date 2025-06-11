import React, { useContext } from "react";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
import {
  FaUserCircle,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaTelegram,
} from "react-icons/fa";

export default function About() {
  const { siteConfig } = useContext(SiteConfigContext);
  const teamMembers = [
    {
      name: "مهندس حمید عسگری",
      role: "کارشناس عمران",
      image: "https://placehold.co/400x400/344e41/ffffff?text=H.A",
      contacts: {
        phone: "09120000001",
        email: "ali@example.com",
        whatsapp: "989120000001",
        telegram: "https://t.me/ali_m",
      },
    },
    {
      name: "مهندس شایان زربخش",
      role: "کارشناس عمران",
      image: null,
      contacts: {
        phone: "09120000002",
        email: "sara@example.com",
        whatsapp: "989120000002",
        telegram: "https://t.me/sara_r",
      },
    },
    {
      name: "مهندس نگار کاظمی",
      role: "کارشناس عمران",
      image: "https://placehold.co/400x400/588157/ffffff?text=N.K",
      contacts: {
        phone: "09120000003",
        email: "reza@example.com",
        whatsapp: "989120000003",
        telegram: "https://t.me/absolute",
      },
    },
    {
      name: "مهندس امیر فربد",
      role: "کارشناس عمران",
      image: "https://placehold.co/400x400/588157/ffffff?text=A.F",
      contacts: {
        phone: "09120000003",
        email: "reza@example.com",
        whatsapp: "989120000003",
        telegram: "https://t.me/absolute",
      },
    },
  ];

  return (
    <div className="bg-white font-sans text-right animate-fade-in page-content fade-in slide-in-from-bottom duration-700">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-orange-900 to-teal-800 text-white py-24 lg:py-40 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://placehold.co/1920x400/2d3748/cccccc?text=About+Us')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60" />
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            درباره ما
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
            آشنایی بیشتر با داستان، اهداف و تیم{" "}
            {siteConfig?.site_name || "شرکت ما"}.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2 p-4">
              <img
                src="https://placehold.co/600x400/e2e8f0/3a5a40?text=Qecta+Sazeh+Hirkasb"
                alt="دفتر شرکت"
                className="w-full rounded-lg shadow-2xl object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="w-full lg:w-1/2 p-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
                داستان ما
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                شرکت ککتوسازه هیرکاسب در سال ... با هدف ارائه خدمات نوین و دقیق
                مهندسی تاسیس شد. ما با تکیه بر دانش فنی و تجربه اعضای تیم،
                توانسته‌ایم پروژه‌های متعددی را در زمینه نقشه‌برداری، امور ثبتی
                و نظارت با موفقیت به اتمام برسانیم.
              </p>
              <p className="text-gray-600 leading-relaxed">
                چشم‌انداز ما تبدیل شدن به یکی از معتبرترین شرکت‌های مهندسی در
                سطح کشور و ارائه راهکارهای خلاقانه برای چالش‌های عمرانی است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              تیم متخصص ما
            </h2>
            <div className="mt-4 h-2 w-24 bg-orange-500 mx-auto rounded-full" />
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
              موتور محرک موفقیت ما، تیمی از افراد متخصص، با انگیزه و خلاق است.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-t from-orange-50 to-white"
              >
                <div className="w-32 h-32 rounded-full mb-4 shadow-md bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-orange-100 transition-transform duration-300 group-hover:scale-110">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-orange-500 font-semibold mb-4">
                  {member.role}
                </p>
                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-200 w-full justify-center">
                  <a
                    href={`tel:${member.contacts.phone}`}
                    className="relative text-gray-600 hover:text-orange-500 p-2 rounded-full transition-colors group/icon"
                    aria-label="تماس تلفنی"
                  >
                    <FaPhone className="w-6 h-6 transition-transform duration-300 group-hover/icon:rotate-12 group-hover/icon:scale-125" />
                    <span className="absolute inset-0 rounded-full bg-orange-200 opacity-0 group-hover/icon:opacity-20 scale-0 group-hover/icon:scale-150 transition-all duration-300" />
                  </a>
                  <a
                    href={`mailto:${member.contacts.email}`}
                    className="relative text-gray-600 hover:text-orange-500 p-2 rounded-full transition-colors group/icon"
                    aria-label="ایمیل"
                  >
                    <FaEnvelope className="w-6 h-6 transition-transform duration-300 group-hover/icon:rotate-12 group-hover/icon:scale-125" />
                    <span className="absolute inset-0 rounded-full bg-orange-200 opacity-0 group-hover/icon:opacity-20 scale-0 group-hover/icon:scale-150 transition-all duration-300" />
                  </a>
                  <a
                    href={`https://wa.me/${member.contacts.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative text-gray-600 hover:text-teal-600 p-2 rounded-full transition-colors group/icon"
                    aria-label="واتساپ"
                  >
                    <FaWhatsapp className="w-6 h-6 transition-transform duration-300 group-hover/icon:rotate-12 group-hover/icon:scale-125" />
                    <span className="absolute inset-0 rounded-full bg-teal-200 opacity-0 group-hover/icon:opacity-20 scale-0 group-hover/icon:scale-150 transition-all duration-300" />
                  </a>
                  <a
                    href={member.contacts.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative text-gray-600 hover:text-teal-600 p-2 rounded-full transition-colors group/icon"
                    aria-label="تلگرام"
                  >
                    <FaTelegram className="w-6 h-6 transition-transform duration-300 group-hover/icon:rotate-12 group-hover/icon:scale-125" />
                    <span className="absolute inset-0 rounded-full bg-teal-200 opacity-0 group-hover/icon:opacity-20 scale-0 group-hover/icon:scale-150 transition-all duration-300" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
