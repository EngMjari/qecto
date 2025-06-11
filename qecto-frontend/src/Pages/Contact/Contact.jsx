import React, { useContext, useState } from "react";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
import {
  FaMagic,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaComment,
} from "react-icons/fa";

export default function Contact({ showToast }) {
  const { siteConfig } = useContext(SiteConfigContext);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [projectIdea, setProjectIdea] = useState("");
  const [isFormalizing, setIsFormalizing] = useState(false);

  const validatePhone = (phone) => /^09\d{9}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

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
      showToast("پیام شما با موفقیت ارسال شد!");
      setFormData({ name: "", phone: "", subject: "", message: "" });
    } else {
      showToast("لطفا خطاهای فرم را برطرف کنید.", "error");
    }
  };

  const handleGenerateSuggestion = async () => {
    if (!projectIdea) {
      showToast("لطفا ایده پروژه خود را وارد کنید.", "error");
      return;
    }
    setIsSuggesting(true);
    setSuggestion("");

    const prompt = `شما یک مشاور متخصص در یک شرکت مهندسی ایرانی به نام "ککتوسازه هیرکاسب" هستید. یک کاربر ایده پروژه خود را شرح داده است. بر اساس توضیحات کاربر، سرویس‌های مهندسی لازم را از لیست زیر پیشنهاد دهید: [نقشه‌برداری دقیق, کارشناسی امور ثبتی, نظارت پروژه, اجرای پروژه]. برای هر سرویس پیشنهادی، یک توضیح کوتاه و واضح به زبان فارسی ارائه دهید که چرا آن سرویس برای پروژه کاربر ضروری است. پاسخ شما باید به فرمت مارک‌داون باشد. توضیحات کاربر: "${projectIdea}"`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAoS_90swGb2GB2ThqbhlmRVpGDnT-zY3A`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts[0]?.text) {
        setSuggestion(result.candidates[0].content.parts[0].text);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      showToast("خطا در دریافت پیشنهاد. لطفا دوباره تلاش کنید.", "error");
      console.error("Gemini API Error:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleFormalizeRequest = async () => {
    if (!formData.message) {
      showToast("لطفا ابتدا پیام خود را بنویسید.", "error");
      return;
    }
    setIsFormalizing(true);

    const prompt = `پیام غیررسمی زیر را از یک کاربر به یک درخواست پروژه رسمی، ساختاریافته و مودبانه برای یک شرکت مهندسی ایرانی تبدیل کن. متن باید مختصر و حرفه‌ای باشد. توضیحاتی اضافه نکن فقط پیام را بنویس. پیام کاربر: "${formData.message}"`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAoS_90swGb2GB2ThqbhlmRVpGDnT-zY3A`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts[0]?.text) {
        setFormData({
          ...formData,
          message: result.candidates[0].content.parts[0].text,
        });
        showToast("پیام شما به حالت رسمی تبدیل شد.");
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      showToast("خطا در رسمی‌سازی پیام. لطفا دوباره تلاش کنید.", "error");
      console.error("Gemini API Error:", error);
    } finally {
      setIsFormalizing(false);
    }
  };

  return (
    <div className="page-content bg-gray-50 text-right font-sans">
      {/* Header */}
      <header className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-16 md:py-24 relative">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold drop-shadow-md">
            تماس با ما
          </h1>
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
            از طریق فرم زیر با ما در ارتباط باشید یا از راهنمای هوشمند پروژه
            استفاده کنید.
          </p>
        </div>
      </header>

      {/* Smart Project Guide */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <FaMagic className="w-8 h-8 text-orange-500" />
              راهنمای هوشمند پروژه
            </h2>
            <div className="mt-4 h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto">
              ایده پروژه خود را بنویسید تا خدمات مهندسی مناسب پیشنهاد شود.
            </p>
          </div>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg animate-fade-in">
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              rows="4"
              placeholder="مثال: قصد ساخت ویلای دوبلکس در زمین 1000 متری در شمال دارم."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
            <button
              onClick={handleGenerateSuggestion}
              disabled={isSuggesting}
              className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSuggesting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaMagic className="w-5 h-5" />
              )}
              {isSuggesting ? "در حال پردازش..." : "دریافت پیشنهاد"}
            </button>
            {suggestion && (
              <div className="mt-6 p-4 border-r-4 border-teal-500 bg-teal-50 rounded-lg max-h-64 overflow-y-auto">
                <h4 className="font-bold text-teal-800 mb-2">
                  پیشنهاد هوش مصنوعی:
                </h4>
                <div className="text-gray-700 text-sm leading-relaxed">
                  {suggestion}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ارسال پیام
              </h2>
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`peer w-full bg-transparent border-b-2 px-4 pt-4 pb-1 text-right text-sm text-gray-900 focus:border-orange-500 focus:outline-none transition-all ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <FaUser className="absolute left-2 top-4 text-gray-400 peer-focus:text-orange-500" />
                  <label
                    htmlFor="name"
                    className="absolute right-4 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-orange-500"
                  >
                    نام
                  </label>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`peer w-full bg-transparent border-b-2 px-4 pt-4 pb-1 text-right text-sm text-gray-900 focus:border-orange-500 focus:outline-none transition-all ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <FaPhone className="absolute left-2 top-4 text-gray-400 peer-focus:text-orange-500" />
                  <label
                    htmlFor="phone"
                    className="absolute right-4 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-orange-500"
                  >
                    شماره موبایل
                  </label>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`peer w-full bg-transparent border-b-2 px-4 pt-4 pb-1 text-right text-sm text-gray-900 focus:border-orange-500 focus:outline-none transition-all ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <FaComment className="absolute left-2 top-4 text-gray-400 peer-focus:text-orange-500" />
                  <label
                    htmlFor="subject"
                    className="absolute right-4 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-orange-500"
                  >
                    موضوع
                  </label>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    name="message"
                    id="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={`peer w-full bg-transparent border-b-2 px-4 pt-4 pb-1 text-right text-sm text-gray-900 focus:border-orange-500 focus:outline-none transition-all ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <FaComment className="absolute left-2 top-4 text-gray-400 peer-focus:text-orange-500" />
                  <label
                    htmlFor="message"
                    className="absolute right-4 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-orange-500"
                  >
                    متن پیام
                  </label>
                  <div className="flex justify-between items-center mb-2 p-2">
                    <button
                      type="button"
                      onClick={handleFormalizeRequest}
                      disabled={isFormalizing || !formData.message}
                      className="text-xs flex items-center gap-1 text-teal-600 hover:text-teal-800 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {isFormalizing ? (
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaMagic className="w-4 h-4" />
                      )}
                      {isFormalizing ? "..." : "ایجاد درخواست رسمی"}
                    </button>
                  </div>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all shadow-md"
                >
                  ارسال پیام
                </button>
              </form>
            </div>
            {/* Contact Info */}
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-lg p-6 h-full shadow-lg">
                <h2 className="text-2xl font-bold mb-6">اطلاعات تماس</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FaMapMarkerAlt className="w-6 h-6 text-orange-400 mt-1" />
                    <div>
                      <h3 className="font-bold">آدرس</h3>
                      <p>{siteConfig?.address || "آدرس"}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaPhone className="w-6 h-6 text-orange-400 mt-1" />
                    <div>
                      <h3 className="font-bold">تلفن</h3>
                      <p>{siteConfig?.phone || "شماره تماس"}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaEnvelope className="w-6 h-6 text-orange-400 mt-1" />
                    <div>
                      <h3 className="font-bold">ایمیل</h3>
                      <p>{siteConfig?.email || "ایمیل"}</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-teal-600/50">
                  <p>ساعات کاری: شنبه تا چهارشنبه، ۹ صبح تا ۵ عصر</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
