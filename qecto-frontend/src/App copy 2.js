import React, { useState, useEffect, useRef } from "react";

// Helper to construct class names
const cx = (...classes) => classes.filter(Boolean).join(" ");

//============================================================================
//  Icon Components (Inline SVG for simplicity)
//============================================================================

const MenuIcon = ({ c }) => (
  <svg
    className={c}
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const XIcon = ({ c }) => (
  <svg
    className={c}
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const MapPinIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
const PhoneIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);
const MailIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);
const HomeIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const InfoIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const UserIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const UserCircleIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
    <circle cx="12" cy="10" r="3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const ChevronDownIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
const LogInIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);
const WhatsappIcon = ({ c }) => (
  <svg
    className={c}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
  </svg>
);
const TelegramIcon = ({ c }) => (
  <svg
    className={c}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15.91L18.23 18.2c-.27.67-1.02.81-1.55.4l-4.1-3.25-2.02 1.93c-.23.23-.42.41-.65.41z" />
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
const SparklesIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3z" />
    <path d="M5 21L6 17" />
    <path d="M19 21L18 17" />
    <path d="M22 5L20 7" />
    <path d="M2 5L4 7" />
  </svg>
);

//============================================================================
//  Page Components
//============================================================================
const HomePage = ({ setPage }) => {
  const services = [
    {
      icon: "📐",
      title: "نقشه‌برداری دقیق",
      description:
        "خدمات جامع نقشه‌برداری با تجهیزات مدرن برای پروژه‌های عمرانی و ثبتی.",
    },
    {
      icon: "⚖️",
      title: "کارشناسی امور ثبتی",
      description:
        "مشاوره و انجام کلیه امور تفکیک، افراز و تهیه نقشه‌های UTM ثبتی.",
    },
    {
      icon: "🏗️",
      title: "نظارت پروژه",
      description:
        "نظارت دقیق بر اجرای پروژه‌های ساختمانی مطابق با استانداردها و مقررات.",
    },
    {
      icon: "👷",
      title: "اجرای پروژه",
      description:
        "مدیریت و اجرای پروژه‌های عمرانی و ساختمانی با بالاترین کیفیت.",
    },
  ];

  return (
    <div className="animate-fade-in" style={{ direction: "rtl" }}>
      <section className="relative text-white bg-teal-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://placehold.co/1920x1080/0d524d/cccccc?text=Kaktus+Sazeh')",
            opacity: "0.2",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-6 py-32 md:py-40 text-center">
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-4"
            style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.5)" }}
          >
            ککتوسازهیرکاسب
          </h1>
          <p
            className="text-lg md:text-2xl mb-8 font-light max-w-3xl mx-auto"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            تخصص، دقت و تعهد در ارائه خدمات مهندسی نوین
          </p>
          <button
            onClick={() => setPage("contact")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          >
            مشاوره رایگان
          </button>
        </div>
      </section>

      <StatsSection />

      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              خدمات ما
            </h2>
            <div className="mt-4 h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              ما با بهره‌گیری از دانش روز و تیم مجرب، آماده ارائه بهترین خدمات
              مهندسی به شما هستیم.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center transform hover:-translate-y-2 border-t-4 border-transparent hover:border-orange-500"
              >
                <div className="text-6xl mb-5 flex justify-center items-center h-16">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const AboutPage = () => {
  const teamMembers = [
    {
      name: "مهندس علی محمدی",
      role: "مدیرعامل و موسس",
      image: "https://placehold.co/400x400/344e41/ffffff?text=A.M",
      contacts: {
        phone: "09120000001",
        email: "ali@example.com",
        whatsapp: "989120000001",
        telegram: "ali_m",
      },
    },
    {
      name: "مهندس سارا رضایی",
      role: "سرپرست تیم نقشه‌برداری",
      image: null,
      contacts: {
        phone: "09120000002",
        email: "sara@example.com",
        whatsapp: "989120000002",
        telegram: "sara_r",
      },
    },
    {
      name: "مهندس رضا حسینی",
      role: "مدیر پروژه های اجرایی",
      image: "https://placehold.co/400x400/588157/ffffff?text=R.H",
      contacts: {
        phone: "09120000003",
        email: "reza@example.com",
        whatsapp: "989120000003",
        telegram: "reza_h",
      },
    },
  ];

  return (
    <div className="animate-fade-in bg-white" style={{ direction: "rtl" }}>
      <div
        className="bg-gray-800 text-white py-24 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://placehold.co/1920x400/2d3748/cccccc?text=About+Us')",
        }}
      >
        <div className="bg-black bg-opacity-50 inset-0 absolute"></div>
        <div className="container relative mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">درباره ما</h1>
          <p className="text-lg text-gray-300 mt-4">
            آشنایی بیشتر با داستان، اهداف و تیم ککتوسازهیرکاسب
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
              <img
                src="https://placehold.co/600x400/e2e8f0/3a5a40?text=دفتر+شرکت"
                alt="دفتر شرکت"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="w-full md:w-1/2 px-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                داستان ما
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                شرکت ککتوسازهیرکاسب در سال ... با هدف ارائه خدمات نوین و دقیق
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

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              تیم متخصص ما
            </h2>
            <div className="mt-4 h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              موتور محرک موفقیت ما، تیمی از افراد متخصص، با انگیزه و خلاق است.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="w-32 h-32 rounded-full mb-4 shadow-md bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon c="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-orange-500 font-semibold mb-4">
                  {member.role}
                </p>
                <div className="flex space-l-3 mt-auto pt-4 border-t w-full justify-center">
                  <a
                    href={`tel:${member.contacts.phone}`}
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <PhoneIcon c="w-6 h-6" />
                  </a>
                  <a
                    href={`mailto:${member.contacts.email}`}
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <MailIcon c="w-6 h-6" />
                  </a>
                  <a
                    href={`https://wa.me/${member.contacts.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <WhatsappIcon c="w-6 h-6" />
                  </a>
                  <a
                    href={`https://t.me/${member.contacts.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <TelegramIcon c="w-6 h-6" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactPage = ({ showToast }) => {
  // State for the contact form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  // State for Gemini API features
  const [suggestion, setSuggestion] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [projectIdea, setProjectIdea] = useState("");
  const [isFormalizing, setIsFormalizing] = useState(false);

  const validatePhone = (phone) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Handles the form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = "نام الزامی است.";
    if (!validatePhone(formData.phone))
      newErrors.phone = "شماره موبایل معتبر نیست.";
    if (!formData.subject) newErrors.subject = "موضوع الزامی است.";
    if (!formData.message) newErrors.message = "متن پیام الزامی است.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form Submitted:", formData);
      // Here you would typically send the data to a server
      showToast("پیام شما با موفقیت ارسال شد!");
      setFormData({ name: "", phone: "", subject: "", message: "" });
    } else {
      showToast("لطفا خطاهای فرم را برطرف کنید.", "error");
    }
  };

  /**
   * Calls Gemini API to get project service suggestions
   */
  const handleGenerateSuggestion = async () => {
    if (!projectIdea) {
      showToast("لطفا ایده پروژه خود را وارد کنید.", "error");
      return;
    }
    setIsSuggesting(true);
    setSuggestion("");

    const prompt = `شما یک مشاور متخصص در یک شرکت مهندسی ایرانی به نام "ککتوسازهیرکاسب" هستید. یک کاربر ایده پروژه خود را شرح داده است. بر اساس توضیحات کاربر، سرویس‌های مهندسی لازم را از لیست زیر پیشنهاد دهید: [نقشه‌برداری دقیق, کارشناسی امور ثبتی, نظارت پروژه, اجرای پروژه]. برای هر سرویس پیشنهادی، یک توضیح کوتاه و واضح به زبان فارسی ارائه دهید که چرا آن سرویس برای پروژه کاربر ضروری است. پاسخ شما باید به فرمت مارک‌داون باشد. توضیحات کاربر: "${projectIdea}"`;

    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;
        setSuggestion(text);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (error) {
      showToast(
        "خطا در ارتباط با سرویس هوشمند. لطفا دوباره تلاش کنید.",
        "error"
      );
      console.error("Gemini API Error:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  /**
   * Calls Gemini API to formalize the user's message
   */
  const handleFormalizeRequest = async () => {
    if (!formData.message) {
      showToast("لطفا ابتدا پیام خود را بنویسید.", "error");
      return;
    }
    setIsFormalizing(true);
    const prompt = `پیام غیررسمی زیر را از یک کاربر به یک درخواست پروژه رسمی، ساختاریافته و مودبانه برای یک شرکت مهندسی ایرانی تبدیل کن. متن باید مختصر و حرفه‌ای باشد. پیام کاربر: "${formData.message}"`;

    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const formalText = result.candidates[0].content.parts[0].text;
        setFormData({ ...formData, message: formalText });
        showToast("پیام شما به حالت رسمی تبدیل شد.");
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (error) {
      showToast(
        "خطا در ارتباط با سرویس هوشمند. لطفا دوباره تلاش کنید.",
        "error"
      );
      console.error("Gemini API Error:", error);
    } finally {
      setIsFormalizing(false);
    }
  };

  return (
    <div className="animate-fade-in bg-gray-50" style={{ direction: "rtl" }}>
      <div
        className="bg-gray-800 text-white py-24 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://placehold.co/1920x400/2d3748/cccccc?text=Contact+Us')",
        }}
      >
        <div className="bg-black bg-opacity-50 inset-0 absolute"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">تماس با ما</h1>
          <p className="text-lg text-gray-300 mt-4">
            از طریق فرم زیر با ما در ارتباط باشید یا از راهنمای هوشمند ما کمک
            بگیرید.
          </p>
        </div>
      </div>

      {/* Gemini Feature: Smart Project Guide */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <SparklesIcon c="w-8 h-8 text-orange-500" />
              راهنمای هوشمند پروژه
            </h2>
            <div className="mt-4 h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              ایده یا مشکل خود را شرح دهید تا هوش مصنوعی ما، خدمات مورد نیاز شما
              را پیشنهاد دهد.
            </p>
          </div>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              rows="4"
              placeholder="مثال: یک زمین 1000 متری در شمال دارم و قصد ساخت یک ویلای دوبلکس را دارم. از کجا باید شروع کنم؟"
              className="w-full px-4 py-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            ></textarea>
            <button
              onClick={handleGenerateSuggestion}
              disabled={isSuggesting}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:bg-teal-400 disabled:cursor-not-allowed"
            >
              {isSuggesting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <SparklesIcon c="w-6 h-6" />
              )}
              <span>
                {isSuggesting ? "در حال بررسی..." : "✨ دریافت پیشنهاد"}
              </span>
            </button>
            {isSuggesting && (
              <p className="text-center text-sm text-gray-500 mt-2">
                درحال پردازش... این فرآیند ممکن است چند ثانیه طول بکشد.
              </p>
            )}
            {suggestion && (
              <div className="mt-6 p-4 border-r-4 border-teal-500 bg-teal-50 rounded-lg animate-fade-in">
                <h4 className="font-bold text-teal-800 mb-2">
                  پیشنهاد هوش مصنوعی:
                </h4>
                <div
                  className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm"
                  style={{ fontFamily: "Vazirmatn, sans-serif" }}
                >
                  {suggestion}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-xl shadow-2xl p-8 lg:p-12 flex flex-wrap -m-4">
            <div className="w-full lg:w-1/2 p-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ارسال پیام مستقیم
              </h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="نام شما"
                    value={formData.name}
                    onChange={handleChange}
                    className={cx(
                      "w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2",
                      errors.name
                        ? "border-red-500 ring-red-300"
                        : "border-gray-200 focus:ring-orange-400"
                    )}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="mb-4">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="شماره تماس (مثال: 09123456789)"
                    value={formData.phone}
                    onChange={handleChange}
                    className={cx(
                      "w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2",
                      errors.phone
                        ? "border-red-500 ring-red-300"
                        : "border-gray-200 focus:ring-orange-400"
                    )}
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    name="subject"
                    placeholder="موضوع پیام"
                    value={formData.subject}
                    onChange={handleChange}
                    className={cx(
                      "w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2",
                      errors.subject
                        ? "border-red-500 ring-red-300"
                        : "border-gray-200 focus:ring-orange-400"
                    )}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="message"
                      className="block text-gray-700 font-bold"
                    >
                      پیام شما
                    </label>
                    <button
                      type="button"
                      onClick={handleFormalizeRequest}
                      disabled={isFormalizing || !formData.message}
                      className="text-xs flex items-center gap-1 text-teal-600 hover:text-teal-800 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {isFormalizing ? (
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <SparklesIcon c="w-4 h-4" />
                      )}
                      <span>
                        {isFormalizing ? "..." : "✨ ایجاد درخواست رسمی"}
                      </span>
                    </button>
                  </div>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="متن پیام خود را اینجا بنویسید..."
                    value={formData.message}
                    onChange={handleChange}
                    className={cx(
                      "w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2",
                      errors.message
                        ? "border-red-500 ring-red-300"
                        : "border-gray-200 focus:ring-orange-400"
                    )}
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  ارسال پیام
                </button>
              </form>
            </div>
            <div className="w-full lg:w-1/2 p-4 mt-8 lg:mt-0">
              <div className="bg-teal-800 rounded-lg p-8 h-full text-white bg-gradient-to-br from-teal-700 to-teal-900 shadow-xl">
                <h2 className="text-2xl font-bold mb-6">اطلاعات تماس</h2>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <MapPinIcon c="w-7 h-7 ml-4 mt-1 flex-shrink-0 text-orange-400" />
                    <div>
                      <h3 className="font-bold">آدرس</h3>
                      <p>
                        استان گلستان، گرگان، خیابان ولیعصر، عدالت ۲۲، مجتمع
                        هیرکان، طبقه ۵، واحد ۴۱۴
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <PhoneIcon c="w-6 h-6 ml-4 mt-1 flex-shrink-0 text-orange-400" />
                    <div>
                      <h3 className="font-bold">تلفن</h3>
                      <p>۰۱۷-۱۲۳۴۵۶۷۸</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MailIcon c="w-6 h-6 ml-4 mt-1 flex-shrink-0 text-orange-400" />
                    <div>
                      <h3 className="font-bold">ایمیل</h3>
                      <p>info@kaktussazeh.com</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-teal-600/50">
                  <p>ساعات کاری: شنبه تا چهارشنبه، ۹ صبح تا ۵ عصر</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const PortfolioPage = () => {
  return (
    <div
      className="h-96 flex items-center justify-center text-3xl"
      style={{ direction: "rtl" }}
    >
      صفحه نمونه کارها
    </div>
  );
};

//============================================================================
//  Layout & UI Components
//============================================================================
const Header = ({ setPage, activePage, user, openLoginModal, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const logoUrl =
    "https://firebasestorage.googleapis.com/v0/b/gemini-ui-project-14732.appspot.com/o/files%2Fuploaded%3AArtboard%201%20copy%202%40300x-8.png-d1f8ae3f-fb33-4261-ade6-54acfd637e2d?alt=media&token=1646399c-e35e-4c28-912a-8288da6183e8";

  const guestLinks = [
    { name: "صفحه اصلی", page: "home" },
    { name: "درباره ما", page: "about" },
    { name: "تماس با ما", page: "contact" },
  ];
  const userLinks = [...guestLinks, { name: "نمونه کارها", page: "portfolio" }];
  const adminLinks = [...userLinks, { name: "مدیریت کاربران", page: "users" }];
  const superAdminLinks = [
    ...adminLinks,
    { name: "تنظیمات کلی", page: "settings" },
  ];

  let navLinks = guestLinks;
  if (user.role === "user") navLinks = userLinks;
  if (user.role === "admin") navLinks = adminLinks;
  if (user.role === "superadmin") navLinks = superAdminLinks;

  const handleNavClick = (page) => {
    setPage(page);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);

  return (
    <header
      className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50"
      style={{ direction: "rtl" }}
    >
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick("home")}
          >
            <img
              src={logoUrl}
              alt="لوگو ککتوسازهیرکاسب"
              className="h-12 w-auto"
            />
          </div>
          <nav className="hidden lg:flex space-l-1 items-center font-medium">
            {navLinks.map((link) => (
              <a
                key={link.page}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.page);
                }}
                className={cx(
                  "py-2 px-4 rounded-md transition-all duration-300 text-sm",
                  activePage === link.page
                    ? "text-white bg-teal-800 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!user.isLoggedIn ? (
            <button
              onClick={openLoginModal}
              className="hidden md:flex items-center gap-2 bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-orange-600"
            >
              <LogInIcon c="w-5 h-5" />
              <span>ورود | ثبت‌نام</span>
            </button>
          ) : (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-gray-100 py-2 px-3 rounded-lg hover:bg-gray-200 transition"
              >
                <UserIcon c="w-6 h-6 text-teal-800" />
                <span className="font-semibold text-gray-700">پنل کاربری</span>
                <ChevronDownIcon
                  c={cx(
                    "w-5 h-5 text-gray-500 transition-transform",
                    isUserMenuOpen && "rotate-180"
                  )}
                />
              </button>
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 animate-fade-in-fast">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    پروفایل من
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                  >
                    خروج
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <MenuIcon c="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white pb-4 animate-fade-in-fast">
          <nav className="flex flex-col items-center space-y-2 px-4">
            {navLinks.map((link) => (
              <a
                key={link.page}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.page);
                }}
                className={cx(
                  "block py-2 px-4 text-base w-full text-center rounded-md",
                  activePage === link.page
                    ? "text-white bg-teal-800"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  return (
    <footer
      className="bg-gray-800 text-white mt-auto"
      style={{ direction: "rtl" }}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div>
            <h3 className="text-lg font-bold mb-4">ککتوسازهیرکاسب</h3>
            <p className="text-gray-400">
              ارائه دهنده خدمات تخصصی مهندسی شامل نقشه‌برداری، امور ثبتی، نظارت
              و اجرای پروژه‌های عمرانی.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">لینک‌های سریع</h3>
            <ul className="text-gray-400 space-y-2">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  صفحه اصلی
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  درباره ما
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  تماس با ما
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  نمونه کارها
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">تماس با ما</h3>
            <ul className="text-gray-400 space-y-2">
              <li>گرگان، خ ولیعصر، عدالت ۲۲...</li>
              <li>تلفن: ۰۱۷-۱۲۳۴۵۶۷۸</li>
              <li>ایمیل: info@kaktussazeh.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} شرکت ککتوسازهیرکاسب. تمام حقوق
            محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

const MobileBottomNav = ({ page, setPage, openLoginModal, user }) => {
  const navItems = [
    { name: "home", label: "اصلی", icon: HomeIcon },
    { name: "about", label: "درباره ما", icon: InfoIcon },
    { name: "contact", label: "تماس", icon: PhoneIcon },
    {
      name: user.isLoggedIn ? "panel" : "login",
      label: user.isLoggedIn ? "پنل" : "ورود",
      icon: user.isLoggedIn ? UserIcon : LogInIcon,
    },
  ];
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50"
      style={{ direction: "rtl" }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() =>
              item.name === "login" ? openLoginModal() : setPage(item.name)
            }
            className={cx(
              "flex flex-col items-center justify-center w-full transition-colors duration-300",
              page === item.name ? "text-orange-500" : "text-gray-500"
            )}
          >
            <item.icon c="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, closeModal, login }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm p-8 animate-fade-in"
        style={{ direction: "rtl" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          ورود به پنل کاربری
        </h2>
        <p className="text-center text-gray-500 mb-6">
          برای تست، یک نقش کاربری انتخاب کنید.
        </p>
        <form>
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 font-bold mb-2"
            >
              شماره موبایل
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-left"
              placeholder="0912 345 6789"
              style={{ direction: "ltr" }}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 mb-6"
          >
            دریافت کد تایید
          </button>
        </form>
        <div className="text-center text-sm text-gray-500 mb-4">
          --- حالت دمو ---
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => login("user")}
            className="bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
          >
            ورود کاربر
          </button>
          <button
            onClick={() => login("admin")}
            className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            ورود ادمین
          </button>
          <button
            onClick={() => login("superadmin")}
            className="col-span-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            ورود سوپر ادمین
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onHide }) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 4000);
    return () => clearTimeout(timer);
  }, [onHide]);

  const baseClasses =
    "fixed top-5 right-5 z-[1000] p-4 rounded-lg shadow-lg text-white animate-fade-in-down";
  const typeClasses = {
    success: "bg-teal-600",
    error: "bg-red-600",
  };

  return (
    <div
      className={cx(baseClasses, typeClasses[type])}
      style={{ direction: "rtl" }}
    >
      {message}
    </div>
  );
};

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const startTime = Date.now();
          const frame = () => {
            const now = Date.now();
            const progress = (now - startTime) / duration;
            if (progress < 1) {
              setCount(Math.min(end, Math.floor(end * progress)));
              requestAnimationFrame(frame);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(frame);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString("fa-IR")}</span>;
};

const StatsSection = () => {
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
};

//============================================================================
//  Main App Component
//============================================================================
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState({ isLoggedIn: false, role: "guest" });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800;900&display=swap');
            body { font-family: 'Vazirmatn', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
            .animate-fade-in { animation: fadeIn 0.8s ease-in-out; }
            .animate-fade-in-fast { animation: fadeIn 0.3s ease-in-out; }
            .animate-fade-in-down { animation: fadeInDown 0.5s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const login = (role) => {
    setUser({ isLoggedIn: true, role: role });
    setIsLoginModalOpen(false);
  };
  const logout = () => {
    setUser({ isLoggedIn: false, role: "guest" });
    setPage("home");
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={setPage} />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage showToast={showToast} />;
      case "portfolio":
        return <PortfolioPage />;
      case "users":
        return (
          <div
            className="h-96 flex items-center justify-center text-3xl"
            style={{ direction: "rtl" }}
          >
            صفحه مدیریت کاربران
          </div>
        );
      case "settings":
        return (
          <div
            className="h-96 flex items-center justify-center text-3xl"
            style={{ direction: "rtl" }}
          >
            صفحه تنظیمات کلی
          </div>
        );
      case "panel":
        return (
          <div
            className="h-96 flex items-center justify-center text-3xl"
            style={{ direction: "rtl" }}
          >
            پنل کاربری شما
          </div>
        );
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header
        setPage={setPage}
        activePage={page}
        user={user}
        openLoginModal={() => setIsLoginModalOpen(true)}
        logout={logout}
      />
      <main className="pb-16 md:pb-0 flex-grow">{renderPage()}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav
        page={page}
        setPage={setPage}
        openLoginModal={() => setIsLoginModalOpen(true)}
        user={user}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        closeModal={() => setIsLoginModalOpen(false)}
        login={login}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
