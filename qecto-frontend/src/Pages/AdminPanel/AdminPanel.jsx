import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
// The problematic import for react-toastify's CSS has been removed.
// In a typical React project setup with Webpack or Vite, CSS files are imported
// directly into JS/JSX files and handled by CSS loaders. However, in this specific
// compilation environment, directly importing a CSS file this way causes an error.
// The ToastContainer component often comes with basic default styles, or its CSS
// might be provided through a different mechanism in the target environment.
// 'react-toastify/dist/ReactToastify.css'; // This line caused the error and is now commented out.

// Lucide React Icons (mocked for self-contained immersive)
const Home = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const FileText = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v6h6" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);
const MessageSquare = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const Settings = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const User = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const UploadCloud = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);
const ChevronDown = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const CheckCircle = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);
const XCircle = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);
const Clock = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const Send = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    <path d="M15 15l6-6" />
  </svg>
);
const Archive = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 8H3" />
    <path d="M21 12H3" />
    <path d="M4.5 12.5 2.5 21h19l-2-8.5" />
    <path d="M10 12.5V8h4v4.5" />
  </svg>
);
const Loader2 = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const Menu = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
const LogOut = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="17 17 22 12 17 7" />
    <line x1="22" x2="11" y1="12" y2="12" />
  </svg>
);
const ArrowRightCircle = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="m12 16 4-4-4-4" />
  </svg>
);
const X = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Utility function for mocking API calls
const mockApiCall = (data, delay = 700) => {
  // Slightly reduced delay for snappier feel
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Mock Data
const mockRequests = [
  {
    id: "req1",
    type: "نقشه برداری",
    status: "در حال بررسی",
    user: "علی احمدی",
    date: "۱۴۰۲/۰۳/۱۵",
    description:
      "درخواست نقشه برداری ملک واقع در خیابان آزادی، پلاک ۱۲. نیاز به تایید نهایی و ارسال به بخش فنی و تکمیل مدارک تکمیلی.",
    assignedAdminId: null,
    files: [
      { name: "نقشه_ملک.pdf", url: "#" },
      { name: "اطلاعات_ثبتی.docx", url: "#" },
    ],
    tickets: [
      {
        id: "t1",
        sender: "user",
        message: "مراحل انجام چقدر طول میکشه؟ آیا نیاز به حضور من هست؟",
        date: "۱۴۰۲/۰۳/۱۶",
        replies: [],
      },
      {
        id: "t1-r1",
        sender: "admin",
        message:
          "سلام. معمولا بین ۵ تا ۷ روز کاری زمان میبرد. فعلا نیازی به حضور شما نیست.",
        date: "۱۴۰۲/۰۳/۱۷",
      },
    ],
  },
  {
    id: "req2",
    type: "کارشناسی",
    status: "جدید",
    user: "فاطمه کریمی",
    date: "۱۴۰۲/0۳/۱۷",
    description:
      "کارشناسی ارزش گذاری برای زمین کشاورزی به مساحت ۲۰۰ هکتار در استان فارس، بخش شیراز. اطلاعات تکمیلی در پیوست.",
    assignedAdminId: null,
    files: [{ name: "مشخصات_زمین.xlsx", url: "#" }],
    tickets: [],
  },
  {
    id: "req3",
    type: "اخذ سند",
    status: "تکمیل شده",
    user: "رضا حسینی",
    date: "۱۴۰۲/۰۳/۱۰",
    description:
      "درخواست اخذ سند برای واحد تجاری واقع در مجتمع آفتاب. پرونده تکمیل شده و آماده ارسال به ثبت اسناد جهت پیگیری نهایی.",
    assignedAdminId: "admin2",
    files: [
      { name: "سند_موجود.pdf", url: "#" },
      { name: "وکالتنامه.jpg", url: "#" },
    ],
    tickets: [
      {
        id: "t2",
        sender: "user",
        message: "سند آماده تحویل است؟ آیا میتوانم برای دریافت آن مراجعه کنم؟",
        date: "۱۴۰۲/۰۳/۱۸",
        replies: [
          {
            sender: "admin",
            message: "بله، سند آماده است. لطفا با هماهنگی قبلی مراجعه فرمایید.",
            date: "۱۴۰۲/۰۳/۱۹",
          },
        ],
      },
    ],
  },
  {
    id: "req4",
    type: "نظارت",
    status: "ارجاع شده",
    user: "سارا یوسفی",
    date: "۱۴۰۲/۰۳/۱۴",
    description:
      "نظارت بر ساخت و ساز ویلا در شمال، مازندران، شهر نور. پروژه در مرحله سفت‌کاری است.",
    assignedAdminId: "admin1",
    files: [{ name: "گزارش_پیشرفت.pdf", url: "#" }],
    tickets: [
      {
        id: "t3",
        sender: "user",
        message: "آخرین وضعیت گزارش نظارت چیست؟",
        date: "۱۴۰۲/۰۳/۲۰",
      },
    ],
  },
  {
    id: "req5",
    type: "اجرا",
    status: "جدید",
    user: "امیر قاسمی",
    date: "۱۴۰۲/۰۳/۲۱",
    description:
      "درخواست اجرای پروژه ساختمانی در منطقه جدید شهری، شامل ۱۲ واحد مسکونی و ۲ واحد تجاری.",
    assignedAdminId: null,
    files: [],
    tickets: [],
  },
];

const mockAdmins = [
  { id: "admin1", name: "مهندس احمدی", email: "admin1@example.com" },
  { id: "admin2", name: "خانم قاسمی", email: "admin2@example.com" },
  { id: "admin3", name: "دکتر کریمی", email: "admin3@example.com" },
];

const mockTickets = [
  {
    id: "gt1",
    type: "پشتیبانی",
    subject: "مشکل در بارگذاری فایل",
    user: "محمد رضایی",
    date: "۱۴۰۲/۰۳/۲۰",
    status: "باز",
    messages: [
      {
        sender: "user",
        message:
          "سلام، در بارگذاری فایل در قسمت پروفایل مشکل دارم. لطفا راهنمایی کنید.",
        date: "۱۴۰۲/۰۳/۲۰",
      },
    ],
  },
  {
    id: "gt2",
    type: "پیشنهاد",
    subject: "پیشنهاد قابلیت جدید",
    user: "زهرا قاسمی",
    date: "۱۴۰۲/0۳/۱۹",
    status: "بسته",
    messages: [
      {
        sender: "user",
        message:
          "پیشنهاد میدم قابلیت چت آنلاین برای ارتباط مستقیم با پشتیبانی اضافه بشه.",
        date: "۱۴۰۲/۰۳/۱۹",
      },
      {
        sender: "admin",
        message:
          "ممنون از پیشنهاد عالی شما، در حال بررسی هستیم تا در آینده آن را پیاده‌سازی کنیم.",
        date: "۱۴۰۲/۰۳/۲۰",
      },
    ],
  },
  {
    id: "gt3",
    type: "فنی",
    subject: "خطا در ورود به سیستم",
    user: "مجید حسنی",
    date: "۱۴۰۲/۰۳/۲۲",
    status: "باز",
    messages: [
      {
        sender: "user",
        message:
          "سلام، از دیروز نمیتونم وارد حساب کاربریم بشم. پیغام خطا میده.",
        date: "۱۴۰۲/۰۳/۲۲",
      },
    ],
  },
];

const adminProfile = {
  name: "سید محمد",
  lastName: "حسینی",
  nationalId: "۰۰۱۱۲۳۴۵۶۷",
  profilePic: "https://placehold.co/150x150/1F2937/F3F4F6?text=Admin", // Dark background for profile pic placeholder
};

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [profile, setProfile] = useState(adminProfile);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  // Ref for sidebar to handle clicks outside
  const sidebarRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedRequests = await mockApiCall(mockRequests);
        const fetchedTickets = await mockApiCall(mockTickets);
        const fetchedAdmins = await mockApiCall(mockAdmins);
        setRequests(fetchedRequests);
        setTickets(fetchedTickets);
        setAdmins(fetchedAdmins);
        toast.success("اطلاعات با موفقیت بارگذاری شد!", {
          className: "bg-green-600 text-white",
          bodyClassName: "text-base font-semibold",
          progressClassName: "bg-green-400",
        });
      } catch (error) {
        toast.error("خطا در بارگذاری اطلاعات.", {
          className: "bg-red-600 text-white",
          bodyClassName: "text-base font-semibold",
          progressClassName: "bg-red-400",
        });
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close sidebar on outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        event.target.tagName !== "BUTTON" &&
        event.target.tagName !== "SVG" &&
        event.target.tagName !== "PATH"
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleUpdateProfile = async (updatedProfile) => {
    setLoading(true);
    try {
      await mockApiCall({}); // Simulate API call
      setProfile(updatedProfile);
      toast.success("مشخصات پروفایل با موفقیت به‌روزرسانی شد.", {
        className: "bg-green-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-green-400",
      });
    } catch (error) {
      toast.error("خطا در به‌روزرسانی پروفایل.", {
        className: "bg-red-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-red-400",
      });
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    setLoading(true);
    try {
      const updatedRequests = requests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      );
      await mockApiCall({}); // Simulate API call
      setRequests(updatedRequests);
      toast.success("وضعیت درخواست با موفقیت به‌روزرسانی شد.", {
        className: "bg-green-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-green-400",
      });
    } catch (error) {
      toast.error("خطا در به‌روزرسانی وضعیت درخواست.", {
        className: "bg-red-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-red-400",
      });
      console.error("Error updating request status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRequest = async (requestId, adminId) => {
    setLoading(true);
    try {
      const updatedRequests = requests.map((req) =>
        req.id === requestId ? { ...req, assignedAdminId: adminId } : req
      );
      await mockApiCall({}); // Simulate API call
      setRequests(updatedRequests);
      toast.success("درخواست با موفقیت ارجاع داده شد.", {
        className: "bg-green-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-green-400",
      });
    } catch (error) {
      toast.error("خطا در ارجاع درخواست.", {
        className: "bg-red-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-red-400",
      });
      console.error("Error assigning request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (requestId, file) => {
    setLoading(true);
    try {
      const updatedRequests = requests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              files: [
                ...req.files,
                { name: file.name, url: URL.createObjectURL(file) },
              ],
            }
          : req
      );
      await mockApiCall({}); // Simulate API call
      setRequests(updatedRequests);
      toast.success("فایل با موفقیت آپلود شد.", {
        className: "bg-green-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-green-400",
      });
    } catch (error) {
      toast.error("خطا در آپلود فایل.", {
        className: "bg-red-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-red-400",
      });
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequestTicket = async (requestId, message) => {
    setLoading(true);
    try {
      const newTicket = {
        id: `req-tkt-${Date.now()}`,
        sender: "admin",
        message: message,
        date: new Date().toLocaleDateString("fa-IR"),
        replies: [],
      };
      const updatedRequests = requests.map((req) =>
        req.id === requestId
          ? { ...req, tickets: [...req.tickets, newTicket] }
          : req
      );
      await mockApiCall({}); // Simulate API call
      setRequests(updatedRequests);
      toast.success("پاسخ به تیکت درخواست ارسال شد.", {
        className: "bg-green-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-green-400",
      });
    } catch (error) {
      toast.error("خطا در ارسال تیکت درخواست.", {
        className: "bg-red-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-red-400",
      });
      console.error("Error adding request ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyGeneralTicket = async (ticketId, message) => {
    setLoading(true);
    try {
      const newReply = {
        sender: "admin",
        message: message,
        date: new Date().toLocaleDateString("fa-IR"),
      };
      const updatedTickets = tickets.map((tkt) =>
        tkt.id === ticketId
          ? {
              ...tkt,
              messages: [...tkt.messages, newReply],
              status: "در حال بررسی",
            }
          : tkt
      );
      await mockApiCall({}); // Simulate API call
      setTickets(updatedTickets);
      toast.success("پاسخ به تیکت عمومی ارسال شد.", {
        className: "bg-green-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-green-400",
      });
    } catch (error) {
      toast.error("خطا در ارسال پاسخ تیکت عمومی.", {
        className: "bg-red-600 text-white",
        bodyClassName: "text-base font-semibold",
        progressClassName: "bg-red-400",
      });
      console.error("Error replying general ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center h-full min-h-[calc(100vh-2rem)] md:min-h-screen bg-white rounded-2xl shadow-xl">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
          <p className="text-xl text-gray-700 font-semibold">
            در حال بارگذاری اطلاعات...
          </p>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        const totalRequests = requests.length;
        const newRequests = requests.filter(
          (req) => req.status === "جدید"
        ).length;
        const pendingRequests = requests.filter(
          (req) => req.status === "در حال بررسی"
        ).length;
        const completedRequests = requests.filter(
          (req) => req.status === "تکمیل شده"
        ).length;
        const openTickets = tickets.filter(
          (tkt) => tkt.status === "باز"
        ).length;
        const closedTickets = tickets.filter(
          (tkt) => tkt.status === "بسته"
        ).length;

        const requestTypeCounts = requests.reduce((acc, req) => {
          acc[req.type] = (acc[req.type] || 0) + 1;
          return acc;
        }, {});

        return (
          <div className="p-6 md:p-8 bg-white rounded-2xl shadow-xl min-h-screen animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-4 border-indigo-600 pb-3">
              داشبورد مدیریت
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                icon={<FileText />}
                title="کل درخواست‌ها"
                value={totalRequests}
                color="text-indigo-600"
              />
              <DashboardCard
                icon={<Clock />}
                title="در حال بررسی"
                value={pendingRequests}
                color="text-orange-600"
              />
              <DashboardCard
                icon={<CheckCircle />}
                title="تکمیل شده"
                value={completedRequests}
                color="text-green-600"
              />
              <DashboardCard
                icon={<MessageSquare />}
                title="تیکت‌های باز"
                value={openTickets}
                color="text-rose-600"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 animate-fade-in-up delay-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                آمار درخواست‌ها بر اساس نوع
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(requestTypeCounts).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center p-3 bg-gray-100 rounded-lg transition duration-200 hover:bg-gray-200"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mr-2 animate-pulse"></div>
                    <span className="text-lg text-gray-700 ml-2 font-medium">
                      {type}:
                    </span>
                    <span className="text-lg font-semibold text-indigo-700 mr-auto">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in-up delay-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                آخرین درخواست‌ها
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr className="text-gray-700 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-right rounded-tr-lg">
                        شناسه
                      </th>
                      <th className="py-3 px-6 text-right">نوع</th>
                      <th className="py-3 px-6 text-right">کاربر</th>
                      <th className="py-3 px-6 text-right">وضعیت</th>
                      <th className="py-3 px-6 text-right rounded-tl-lg">
                        تاریخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light">
                    {requests.slice(0, 5).map(
                      (
                        req // Show only the latest 5
                      ) => (
                        <tr
                          key={req.id}
                          className="border-b border-gray-200 hover:bg-indigo-50 hover:text-indigo-900 transition duration-150 ease-in-out"
                        >
                          <td className="py-3 px-6 whitespace-nowrap font-medium text-gray-900">
                            {req.id}
                          </td>
                          <td className="py-3 px-6">{req.type}</td>
                          <td className="py-3 px-6">{req.user}</td>
                          <td className="py-3 px-6">
                            <span
                              className={`py-1 px-3 rounded-full text-xs font-semibold shadow-sm ${
                                req.status === "تکمیل شده"
                                  ? "bg-green-200 text-green-800"
                                  : req.status === "در حال بررسی"
                                  ? "bg-orange-200 text-orange-800"
                                  : req.status === "جدید"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-6">{req.date}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "requests":
        return selectedRequest ? (
          <RequestDetail
            request={selectedRequest}
            onBack={() => setSelectedRequest(null)}
            onUpdateStatus={handleUpdateRequestStatus}
            onAssignRequest={handleAssignRequest}
            onFileUpload={handleFileUpload}
            onAddTicket={handleAddRequestTicket}
            admins={admins}
          />
        ) : (
          <RequestList
            requests={requests}
            onSelectRequest={setSelectedRequest}
          />
        );
      case "tickets":
        return selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            onBack={() => setSelectedTicket(null)}
            onReplyTicket={handleReplyGeneralTicket}
          />
        ) : (
          <TicketList tickets={tickets} onSelectTicket={setSelectedTicket} />
        );
      case "profile":
        return (
          <ProfileSettings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-inter text-right dir-rtl bg-slate-100">
      {/* Mobile Menu Button - Top Right */}
      <button
        className="md:hidden p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg m-4 fixed top-0 right-0 z-50 bg-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef} // Attach ref here
        className={`fixed inset-y-0 right-0 w-64 bg-gray-800 text-white shadow-2xl z-40
                transform ${
                  isSidebarOpen ? "translate-x-0" : "translate-x-full"
                } md:translate-x-0
                transition-transform duration-300 ease-in-out flex flex-col p-6 rounded-l-3xl md:rounded-none`}
      >
        <div className="mb-10 text-center flex flex-col items-center">
          {/* Logo Placeholder */}
          <div className="bg-blue-500 rounded-full p-2 mb-4 shadow-lg flex items-center justify-center w-16 h-16">
            <span className="text-white text-2xl font-bold">AD</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide animate-fade-in-up">
            پنل ادمین
          </h1>
          <p className="text-gray-300 text-sm mt-1 animate-fade-in-up delay-75 opacity-90">
            مدیریت هوشمند و یکپارچه
          </p>
        </div>
        <nav className="flex-1">
          <ul>
            <SidebarItem
              icon={<Home className="ml-3" />}
              text="داشبورد"
              onClick={() => {
                setCurrentView("dashboard");
                setIsSidebarOpen(false);
              }}
              isActive={currentView === "dashboard"}
            />
            <SidebarItem
              icon={<FileText className="ml-3" />}
              text="مدیریت درخواست‌ها"
              onClick={() => {
                setCurrentView("requests");
                setSelectedRequest(null);
                setIsSidebarOpen(false);
              }}
              isActive={currentView === "requests"}
            />
            <SidebarItem
              icon={<MessageSquare className="ml-3" />}
              text="مدیریت تیکت‌ها"
              onClick={() => {
                setCurrentView("tickets");
                setSelectedTicket(null);
                setIsSidebarOpen(false);
              }}
              isActive={currentView === "tickets"}
            />
            <SidebarItem
              icon={<Settings className="ml-3" />}
              text="تنظیمات پروفایل"
              onClick={() => {
                setCurrentView("profile");
                setIsSidebarOpen(false);
              }}
              isActive={currentView === "profile"}
            />
          </ul>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-700 animate-fade-in-up delay-200">
          <div className="flex items-center text-gray-200 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
            <img
              src={profile.profilePic}
              alt="Admin Profile"
              className="w-12 h-12 rounded-full border-3 border-blue-400 shadow-lg ml-3 object-cover"
            />
            <div>
              <p className="font-semibold text-lg">
                {profile.name} {profile.lastName}
              </p>
              <p className="text-xs text-gray-400 opacity-80">ادمین سیستم</p>
            </div>
          </div>
          <button className="mt-4 w-full text-left flex items-center p-3 text-red-300 hover:text-red-100 hover:bg-red-700 rounded-lg transition-all duration-200 font-medium">
            <LogOut className="ml-3 w-5 h-5" />
            خروج از سیستم
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 md:mr-64 relative">
        {/* A wrapper div to make the main content look like a single raised card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 min-h-[calc(100vh-2rem)] md:min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const DashboardCard = ({ icon, title, value, color }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-gray-100 hover:shadow-2xl hover:-translate-y-1">
    <div
      className={`p-4 rounded-full ${color.replace(
        "text",
        "bg"
      )}-100 mb-3 transition-all duration-300 transform hover:scale-110`}
    >
      {React.cloneElement(icon, {
        className: `${icon.props.className || ""} w-10 h-10 ${color}`,
      })}
    </div>
    <p className="text-xl font-semibold text-gray-700 mt-2">{title}</p>
    <p
      className={`text-5xl font-extrabold ${color} mt-2 drop-shadow-md transition-colors duration-200`}
    >
      {value}
    </p>
  </div>
);

const SidebarItem = ({ icon, text, onClick, isActive }) => (
  <li className="mb-4">
    <button
      className={`relative flex items-center w-full p-4 rounded-xl text-lg font-medium transition duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg border border-blue-400"
                    : "text-gray-200 hover:bg-gray-700 hover:text-white"
                }`}
      onClick={onClick}
    >
      {isActive && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-cyan-400 rounded-r-md animate-pulse"></span>
      )}
      {icon}
      <span>{text}</span>
    </button>
  </li>
);

const CommonHeader = ({ title, onBack, hasBackButton = true }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b-4 border-blue-500 pb-4">
    <h2 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">
      {title}
    </h2>
    {hasBackButton && (
      <button
        onClick={onBack}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center group"
      >
        <ArrowRightCircle className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
        بازگشت
      </button>
    )}
  </div>
);

const RequestList = ({ requests, onSelectRequest }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("همه");

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "همه" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in-up">
      <CommonHeader title="مدیریت درخواست‌ها" hasBackButton={false} />

      <div className="flex flex-col md:flex-row justify-between mb-8 gap-5">
        <input
          type="text"
          placeholder="جستجو بر اساس کاربر، شناسه یا توضیحات..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition duration-200 shadow-sm text-gray-800 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition duration-200 shadow-sm md:w-1/4 bg-white text-gray-800"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="همه">همه وضعیت‌ها</option>
          <option value="جدید">جدید</option>
          <option value="در حال بررسی">در حال بررسی</option>
          <option value="تکمیل شده">تکمیل شده</option>
          <option value="ارجاع شده">ارجاع شده</option>
          <option value="لغو شده">لغو شده</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
            <tr className="text-blue-800 uppercase text-sm leading-normal font-bold">
              <th className="py-4 px-6 text-right rounded-tr-xl">شناسه</th>
              <th className="py-4 px-6 text-right">نوع</th>
              <th className="py-4 px-6 text-right">کاربر</th>
              <th className="py-4 px-6 text-right">وضعیت</th>
              <th className="py-4 px-6 text-right">تاریخ</th>
              <th className="py-4 px-6 text-center rounded-tl-xl">عملیات</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => (
                <tr
                  key={req.id}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition duration-200 ease-in-out transform hover:scale-[1.005]`}
                >
                  <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-900">
                    {req.id}
                  </td>
                  <td className="py-4 px-6">{req.type}</td>
                  <td className="py-4 px-6">{req.user}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`py-1.5 px-4 rounded-full text-xs font-bold shadow-sm ${
                        req.status === "تکمیل شده"
                          ? "bg-green-200 text-green-800"
                          : req.status === "در حال بررسی"
                          ? "bg-orange-200 text-orange-800"
                          : req.status === "جدید"
                          ? "bg-blue-200 text-blue-800"
                          : req.status === "ارجاع شده"
                          ? "bg-purple-200 text-purple-800"
                          : "bg-red-200 text-red-800" // For 'لغو شده'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-left">{req.date}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onSelectRequest(req)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center justify-center mx-auto group"
                    >
                      جزئیات
                      <ArrowRightCircle className="mr-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="py-10 text-center text-gray-500 text-lg font-medium"
                >
                  درخواستی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RequestDetail = ({
  request,
  onBack,
  onUpdateStatus,
  onAssignRequest,
  onFileUpload,
  onAddTicket,
  admins,
}) => {
  const [newStatus, setNewStatus] = useState(request.status);
  const [assignedAdmin, setAssignedAdmin] = useState(
    request.assignedAdminId || ""
  );
  const [fileToUpload, setFileToUpload] = useState(null);
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  const handleStatusChange = () => {
    onUpdateStatus(request.id, newStatus);
  };

  const handleAssignSubmit = () => {
    if (assignedAdmin) {
      onAssignRequest(request.id, assignedAdmin);
      setShowAssignModal(false);
    } else {
      toast.error("لطفاً یک مدیر را انتخاب کنید.");
    }
  };

  const handleFileSubmit = () => {
    if (fileToUpload) {
      onFileUpload(request.id, fileToUpload);
      setFileToUpload(null);
      setShowFileUploadModal(false);
    } else {
      toast.error("لطفاً یک فایل برای آپلود انتخاب کنید.");
    }
  };

  const handleTicketSubmit = () => {
    if (newTicketMessage.trim()) {
      onAddTicket(request.id, newTicketMessage);
      setNewTicketMessage("");
    } else {
      toast.error("لطفاً متن تیکت را وارد کنید.");
    }
  };

  const currentAssignedAdmin = admins.find(
    (admin) => admin.id === request.assignedAdminId
  );

  return (
    <div className="animate-fade-in-up">
      <CommonHeader title={`جزئیات درخواست: ${request.id}`} onBack={onBack} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Request Info Card */}
        <div className="lg:col-span-2 bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 animate-fade-in-up delay-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            اطلاعات درخواست
          </h3>
          <p className="mb-3 text-lg">
            <span className="font-semibold text-gray-700">نوع:</span>{" "}
            <span className="text-blue-700 font-medium">{request.type}</span>
          </p>
          <p className="mb-3 text-lg">
            <span className="font-semibold text-gray-700">کاربر:</span>{" "}
            <span className="text-gray-800">{request.user}</span>
          </p>
          <p className="mb-3 text-lg">
            <span className="font-semibold text-gray-700">تاریخ ثبت:</span>{" "}
            <span className="text-gray-800">{request.date}</span>
          </p>
          <p className="mb-5 text-lg">
            <span className="font-semibold text-gray-700">توضیحات:</span>{" "}
            <span className="text-gray-800 leading-relaxed">
              {request.description}
            </span>
          </p>
          <p className="mb-5 text-lg">
            <span className="font-semibold text-gray-700">وضعیت فعلی:</span>{" "}
            <span
              className={`py-1.5 px-4 rounded-full text-base font-bold shadow-sm ${
                request.status === "تکمیل شده"
                  ? "bg-green-200 text-green-800"
                  : request.status === "در حال بررسی"
                  ? "bg-orange-200 text-orange-800"
                  : request.status === "جدید"
                  ? "bg-blue-200 text-blue-800"
                  : request.status === "ارجاع شده"
                  ? "bg-purple-200 text-purple-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {request.status}
            </span>
          </p>
          <p className="mb-4 text-lg">
            <span className="font-semibold text-gray-700">ارجاع به:</span>{" "}
            {currentAssignedAdmin ? (
              <span className="bg-blue-100 text-blue-800 py-1.5 px-4 rounded-full text-base font-bold shadow-sm">
                {currentAssignedAdmin.name}
              </span>
            ) : (
              <span className="text-gray-500 text-base">ارجاع نشده</span>
            )}
          </p>
        </div>

        {/* Actions Card */}
        <div className="bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 animate-fade-in-up delay-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            عملیات
          </h3>

          <div className="mb-6">
            <label
              htmlFor="status-select"
              className="block text-gray-700 text-base font-bold mb-3"
            >
              تغییر وضعیت درخواست:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                id="status-select"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition duration-200 shadow-sm bg-white text-gray-800"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="جدید">جدید</option>
                <option value="در حال بررسی">در حال بررسی</option>
                <option value="تکمیل شده">تکمیل شده</option>
                <option value="لغو شده">لغو شده</option>
              </select>
              <button
                onClick={handleStatusChange}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 shadow-lg active:scale-95 flex items-center justify-center w-full sm:w-auto"
              >
                <CheckCircle className="inline-block ml-2 w-5 h-5" />
                ثبت
              </button>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center active:scale-95"
            >
              <User className="ml-2 w-5 h-5" />
              ارجاع به ادمین دیگر
            </button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowFileUploadModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center active:scale-95"
            >
              <UploadCloud className="ml-2 w-5 h-5" />
              ارسال فایل
            </button>
          </div>

          {request.files.length > 0 && (
            <div className="mt-8 border-t pt-4 border-gray-200">
              <h4 className="text-xl font-bold text-gray-700 mb-3">
                فایل‌های پیوست:
              </h4>
              <ul className="space-y-3 pr-6">
                {request.files.map((file, index) => (
                  <li
                    key={index}
                    className="text-base text-blue-600 hover:text-blue-800 transition duration-150 flex items-center group"
                  >
                    <FileText className="ml-2 w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tickets Section */}
      <div className="bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 mt-8 animate-fade-in-up delay-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          تیکت‌های مربوط به این درخواست
        </h3>
        <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2 mb-6">
          {request.tickets.length > 0 ? (
            request.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition duration-150 hover:bg-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`font-bold text-base ${
                      ticket.sender === "user"
                        ? "text-blue-700"
                        : "text-purple-700"
                    }`}
                  >
                    {ticket.sender === "user" ? "کاربر" : "شما"}
                  </span>
                  <span className="text-xs text-gray-500">{ticket.date}</span>
                </div>
                <p className="text-gray-800 text-base leading-relaxed">
                  {ticket.message}
                </p>
                {ticket.replies &&
                  ticket.replies.map((reply, idx) => (
                    <div
                      key={idx}
                      className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-300 mr-6 shadow-inner"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`font-semibold text-sm ${
                            reply.sender === "user"
                              ? "text-blue-600"
                              : "text-purple-600"
                          }`}
                        >
                          {reply.sender === "user" ? "کاربر" : "شما"} (پاسخ)
                        </span>
                        <span className="text-xs text-gray-500">
                          {reply.date}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {reply.message}
                      </p>
                    </div>
                  ))}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4 text-lg font-medium">
              تیکتی برای این درخواست ثبت نشده است.
            </p>
          )}
        </div>

        <div className="mt-6 border-t pt-6 border-gray-200">
          <h4 className="text-xl font-bold text-gray-700 mb-3">
            ارسال پاسخ / تیکت جدید:
          </h4>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 mb-4 shadow-sm text-gray-800"
            rows="4"
            placeholder="متن پیام شما..."
            value={newTicketMessage}
            onChange={(e) => setNewTicketMessage(e.target.value)}
          ></textarea>
          <button
            onClick={handleTicketSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center active:scale-95"
          >
            <Send className="ml-2 w-5 h-5" />
            ارسال تیکت
          </button>
        </div>
      </div>

      {/* Assign Admin Modal */}
      {showAssignModal && (
        <Modal
          title="ارجاع درخواست به ادمین"
          onClose={() => setShowAssignModal(false)}
        >
          <div className="p-4">
            <label
              htmlFor="admin-select"
              className="block text-gray-700 text-base font-bold mb-3"
            >
              انتخاب ادمین:
            </label>
            <select
              id="admin-select"
              className="w-full p-3 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-3 focus:ring-blue-500 shadow-sm bg-white text-gray-800"
              value={assignedAdmin}
              onChange={(e) => setAssignedAdmin(e.target.value)}
            >
              <option value="">انتخاب کنید...</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg active:scale-95"
            >
              <User className="inline-block ml-2 w-5 h-5" />
              ارجاع
            </button>
          </div>
        </Modal>
      )}

      {/* File Upload Modal */}
      {showFileUploadModal && (
        <Modal title="آپلود فایل" onClose={() => setShowFileUploadModal(false)}>
          <div className="p-4">
            <input
              type="file"
              className="block w-full text-base text-gray-500 file:ml-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mb-5 cursor-pointer transition duration-200"
              onChange={(e) => setFileToUpload(e.target.files[0])}
            />
            {fileToUpload && (
              <p className="text-gray-700 text-base mb-5">
                فایل انتخاب شده:{" "}
                <span className="font-semibold text-blue-700">
                  {fileToUpload.name}
                </span>
              </p>
            )}
            <button
              onClick={handleFileSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg active:scale-95"
            >
              <UploadCloud className="inline-block ml-2 w-5 h-5" />
              آپلود
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const TicketList = ({ tickets, onSelectTicket }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("همه");

  const filteredTickets = tickets.filter((tkt) => {
    const matchesSearch =
      tkt.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tkt.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tkt.messages[0]?.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "همه" || tkt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in-up">
      <CommonHeader title="مدیریت تیکت‌ها" hasBackButton={false} />

      <div className="flex flex-col md:flex-row justify-between mb-8 gap-5">
        <input
          type="text"
          placeholder="جستجو بر اساس کاربر یا موضوع..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition duration-200 shadow-sm text-gray-800 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition duration-200 shadow-sm md:w-1/4 bg-white text-gray-800"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="همه">همه وضعیت‌ها</option>
          <option value="باز">باز</option>
          <option value="در حال بررسی">در حال بررسی</option>
          <option value="بسته">بسته</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
            <tr className="text-blue-800 uppercase text-sm leading-normal font-bold">
              <th className="py-4 px-6 text-right rounded-tr-xl">شناسه</th>
              <th className="py-4 px-6 text-right">نوع</th>
              <th className="py-4 px-6 text-right">موضوع</th>
              <th className="py-4 px-6 text-right">کاربر</th>
              <th className="py-4 px-6 text-right">وضعیت</th>
              <th className="py-4 px-6 text-center rounded-tl-xl">عملیات</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((tkt, index) => (
                <tr
                  key={tkt.id}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition duration-200 ease-in-out transform hover:scale-[1.005]`}
                >
                  <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-900">
                    {tkt.id}
                  </td>
                  <td className="py-4 px-6">{tkt.type}</td>
                  <td className="py-4 px-6">{tkt.subject}</td>
                  <td className="py-4 px-6">{tkt.user}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`py-1.5 px-4 rounded-full text-xs font-bold shadow-sm ${
                        tkt.status === "باز"
                          ? "bg-red-200 text-red-800"
                          : tkt.status === "در حال بررسی"
                          ? "bg-orange-200 text-orange-800"
                          : tkt.status === "بسته"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {tkt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onSelectTicket(tkt)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center justify-center mx-auto group"
                    >
                      جزئیات
                      <ArrowRightCircle className="mr-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="py-10 text-center text-gray-500 text-lg font-medium"
                >
                  تیکتی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TicketDetail = ({ ticket, onBack, onReplyTicket }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [status, setStatus] = useState(ticket.status);

  const handleReplySubmit = () => {
    if (replyMessage.trim()) {
      onReplyTicket(ticket.id, replyMessage);
      setReplyMessage("");
      // Optionally update status to 'در حال بررسی' if not already
      if (status === "باز") {
        setStatus("در حال بررسی");
      }
    } else {
      toast.error("لطفاً متن پاسخ را وارد کنید.");
    }
  };

  const handleCloseTicket = () => {
    // In a real app, this would involve another API call to update the ticket status
    // For this mock, we just change the local state and notify
    setStatus("بسته");
    toast.info("تیکت بسته شد.");
  };

  return (
    <div className="animate-fade-in-up">
      <CommonHeader title={`جزئیات تیکت: ${ticket.subject}`} onBack={onBack} />

      <div className="bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 mb-8 animate-fade-in-up delay-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          اطلاعات تیکت
        </h3>
        <p className="mb-3 text-lg">
          <span className="font-semibold text-gray-700">نوع:</span>{" "}
          <span className="text-blue-700 font-medium">{ticket.type}</span>
        </p>
        <p className="mb-3 text-lg">
          <span className="font-semibold text-gray-700">کاربر:</span>{" "}
          <span className="text-gray-800">{ticket.user}</span>
        </p>
        <p className="mb-3 text-lg">
          <span className="font-semibold text-gray-700">تاریخ ارسال:</span>{" "}
          <span className="text-gray-800">{ticket.date}</span>
        </p>
        <p className="mb-5 text-lg">
          <span className="font-semibold text-gray-700">وضعیت:</span>{" "}
          <span
            className={`py-1.5 px-4 rounded-full text-base font-bold shadow-sm ${
              status === "باز"
                ? "bg-red-200 text-red-800"
                : status === "در حال بررسی"
                ? "bg-orange-200 text-orange-800"
                : status === "بسته"
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {status}
          </span>
        </p>
        {status !== "بسته" && (
          <button
            onClick={handleCloseTicket}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center active:scale-95"
          >
            <Archive className="ml-2 w-5 h-5" />
            بستن تیکت
          </button>
        )}
      </div>

      {/* Ticket Messages */}
      <div className="bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 mt-8 animate-fade-in-up delay-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          مکالمات تیکت
        </h3>
        <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2 mb-6">
          {ticket.messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 p-4 rounded-lg shadow-sm ${
                msg.sender === "user"
                  ? "bg-white border border-gray-200 mr-8"
                  : "bg-blue-100 border border-blue-200 ml-8"
              } transition duration-150 hover:shadow-md`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-bold text-base ${
                    msg.sender === "user" ? "text-blue-700" : "text-blue-700"
                  }`}
                >
                  {" "}
                  {/* Adjusted sender color for admin replies */}
                  {msg.sender === "user" ? "کاربر" : "شما"}
                </span>
                <span className="text-xs text-gray-500">{msg.date}</span>
              </div>
              <p className="text-gray-800 text-base leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {status !== "بسته" && (
          <div className="mt-6 border-t pt-6 border-gray-200">
            <h4 className="text-xl font-bold text-gray-700 mb-3">
              ارسال پاسخ:
            </h4>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 mb-4 shadow-sm text-gray-800"
              rows="3"
              placeholder="پاسخ شما..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            ></textarea>
            <button
              onClick={handleReplySubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center active:scale-95"
            >
              <Send className="ml-2 w-5 h-5" />
              ارسال پاسخ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileSettings = ({ profile, onUpdateProfile }) => {
  const [name, setName] = useState(profile.name);
  const [lastName, setLastName] = useState(profile.lastName);
  const [nationalId, setNationalId] = useState(profile.nationalId);
  const [profilePic, setProfilePic] = useState(profile.profilePic);
  // Removed fileInput state as it's not being used and could cause confusion.

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result); // Base64 for demo, use proper upload to backend in real app
        toast.info(
          "تصویر جدید انتخاب شد، برای ذخیره، دکمه ذخیره تغییرات را بزنید."
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ name, lastName, nationalId, profilePic });
  };

  return (
    <div className="animate-fade-in-up">
      <CommonHeader title="تنظیمات پروفایل" hasBackButton={false} />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 animate-fade-in-up delay-100">
          <img
            src={
              profilePic ||
              "https://placehold.co/150x150/1F2937/F3F4F6?text=Admin"
            }
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-400 shadow-xl mb-6 transition duration-300 ease-in-out transform hover:scale-105"
          />
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center active:scale-95">
            <UploadCloud className="ml-2 w-5 h-5" />
            آپلود عکس
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
        </div>

        <div className="md:col-span-1 bg-gray-50 p-7 rounded-2xl shadow-md border border-gray-200 animate-fade-in-up delay-200">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-gray-700 text-base font-bold mb-3"
            >
              نام:
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 shadow-sm text-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="lastName"
              className="block text-gray-700 text-base font-bold mb-3"
            >
              نام خانوادگی:
            </label>
            <input
              type="text"
              id="lastName"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 shadow-sm text-gray-800"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="mb-7">
            <label
              htmlFor="nationalId"
              className="block text-gray-700 text-base font-bold mb-3"
            >
              کد ملی:
            </label>
            <input
              type="text"
              id="nationalId"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 shadow-sm text-gray-800"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-7 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg active:scale-95"
          >
            <CheckCircle className="inline-block ml-2 w-5 h-5" />
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </div>
  );
};

// Generic Modal Component
const Modal = ({ title, children, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up transform-gpu transition-transform duration-300 ease-out border border-gray-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200 transform hover:rotate-90 active:scale-90"
          >
            <XCircle className="w-7 h-7" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default App;
