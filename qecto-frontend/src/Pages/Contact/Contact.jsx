import React, { useContext, useState } from "react";
import cx from "classnames";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
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

export default function Contact({ showToast }) {
  const { siteConfig } = useContext(SiteConfigContext);

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

    const prompt = `شما یک مشاور متخصص در یک شرکت مهندسی ایرانی به نام "ککتوسازه هیرکاسب" هستید. یک کاربر ایده پروژه خود را شرح داده است. بر اساس توضیحات کاربر، سرویس‌های مهندسی لازم را از لیست زیر پیشنهاد دهید: [نقشه‌برداری دقیق, کارشناسی امور ثبتی, نظارت پروژه, اجرای پروژه]. برای هر سرویس پیشنهادی، یک توضیح کوتاه و واضح به زبان فارسی ارائه دهید که چرا آن سرویس برای پروژه کاربر ضروری است. پاسخ شما باید به فرمت مارک‌داون باشد. توضیحات کاربر: "${projectIdea}"`;

    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyAoS_90swGb2GB2ThqbhlmRVpGDnT-zY3A";
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
    const prompt = `پیام غیررسمی زیر را از یک کاربر به یک درخواست پروژه رسمی، ساختاریافته و مودبانه برای یک شرکت مهندسی ایرانی تبدیل کن. متن باید مختصر و حرفه‌ای باشد. توضیحاتی اضافه نکن فقط پیام را بنویس. پیام کاربر: "${formData.message}"`;

    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyAoS_90swGb2GB2ThqbhlmRVpGDnT-zY3A";
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
    <div
      className="animate-fade-in page-content mx-0 bg-gray-50"
      style={{ direction: "rtl" }}
    >
      <div
        className="bg-gray-800 text-white pt-24 pb-16 lg:pt-40 lg:pb-24 bg-cover bg-center relative"
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
        <div className="container max-w-screen-xl mx-auto  px-6">
          <div className="bg-white rounded-xl shadow-2xl p-8 lg:p-12">
            <div className="flex flex-wrap lg:flex-nowrap lg:gap-0 gap-8 justify-around">
              <div className="w-full lg:w-1/2 px-2">
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
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
              <div className="w-full lg:w-1/2 mt-12 lg:mt-0 px-2">
                <div className="bg-teal-800 rounded-lg p-8 h-full text-white bg-gradient-to-br from-teal-700 to-teal-900 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6">اطلاعات تماس</h2>
                  <ul className="space-y-6">
                    <li className="flex items-start">
                      <MapPinIcon c="w-7 h-7 ml-4 mt-1 flex-shrink-0 text-orange-400" />
                      <div>
                        <h3 className="font-bold">آدرس</h3>
                        <p>{siteConfig?.address || "آدرس"}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <PhoneIcon c="w-6 h-6 ml-4 mt-1 flex-shrink-0 text-orange-400" />
                      <div>
                        <h3 className="font-bold">تلفن</h3>
                        <p>{siteConfig?.phone || "شماره تماس"}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <MailIcon c="w-6 h-6 ml-4 mt-1 flex-shrink-0 text-orange-400" />
                      <div>
                        <h3 className="font-bold">ایمیل</h3>
                        <p>{siteConfig?.email || "ایمیل"}</p>
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
        </div>
      </section>
    </div>
  );
}
