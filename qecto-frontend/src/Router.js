import React, { useContext, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthContext } from "./Contexts/AuthContext";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Contact from "./Pages/Contact/Contact";
import SuperAdminPanel from "./Pages/SuperAdminPanel/SuperAdminPanel";
import AdminPanel from "./Pages/AdminPanel/AdminPanel";
import CreateRequest from "./Pages/Requests/CreateRequest";
import NotFound from "./Pages/NotFound";
import Forbidden from "./Pages/Forbidden";
import ProjectsList from "./Pages/Projects/ProjectsList";
import ProjectDetails from "./Pages/Projects/ProjectDetails";
import NewTicket from "./Pages/Tickets/NewTicket";
import TicketSession from "./Pages/Tickets/TicketSession";
import RequestList from "./Pages/Requests/RequestList";
import RequestPage from "./Pages/Requests/RequestPage";
import TicketListPage from "./Pages/Tickets/TicketListPage"; // اضافه کردن ایمپورت
import Header from "./Components/Layouts/Header";
import Footer from "./Components/Layouts/Footer";
import MobileBottomNav from "./Components/Layouts/MobileBottomNav";
import MobileTopNav from "./Components/Layouts/MobileTopNav";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  HomeIcon,
  InfoIcon,
  PhoneIcon,
  UserIcon,
  SettingsIcon,
  LucideLogIn,
} from "lucide-react";

function ProtectedRoute({
  children,
  isAuthenticated,
  userRole,
  allowedRoles,
  onlyAuth,
}) {
  const { loadingProfile } = useContext(AuthContext);
  if (loadingProfile) {
    return <p className="text-center mt-10">در حال بارگذاری پروفایل...</p>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (onlyAuth) return children;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

function Router() {
  const { isAuthenticated, userRole, logout, userProfile } =
    useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showToast = (message, type = "success") => {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  // لینک‌های نسخه دسکتاپ (بدون ورود)
  const desktopGuestLinks = [
    { name: "خانه", page: "home", link: "/", Icon: HomeIcon },
    { name: "درباره ما", page: "about", link: "/about", Icon: InfoIcon },
    { name: "تماس با ما", page: "contact", link: "/contact", Icon: PhoneIcon },
  ];

  // لینک‌های نسخه موبایل (بدون ورود)
  const mobileGuestLinks = [
    ...desktopGuestLinks,
    { name: "ورود", page: "login", link: "/login", Icon: LucideLogIn },
  ];

  // لینک‌های کاربر عادی
  const userLinks = [
    ...desktopGuestLinks,
    { name: "پنل کاربری", page: "user", link: "/dashboard", Icon: UserIcon },
  ];

  // لینک‌های ادمین
  const adminLinks = [
    ...userLinks,
    { name: "مدیریت", page: "admin", link: "/admin-panel", Icon: SettingsIcon },
  ];

  // لینک‌های سوپرادمین
  const superAdminLinks = [
    ...adminLinks,
    {
      name: "سوپر ادمین",
      page: "superadmin",
      link: "/super-admin-panel",
      Icon: SettingsIcon,
    },
  ];

  let navLinks = isMobile ? mobileGuestLinks : desktopGuestLinks;
  if (userRole === "user") navLinks = userLinks;
  if (userRole === "admin") navLinks = adminLinks;
  if (userRole === "superadmin") navLinks = superAdminLinks;

  const location = useLocation();
  const navigate = useNavigate();

  const activePage =
    navLinks.find((link) => link.link === location.pathname)?.page || "home";

  function setPage(page) {
    const target = navLinks.find((link) => link.page === page);
    if (target) {
      navigate(target.link);
    }
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        style={{ zIndex: 1100 }}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {!isMobile && (
        <Header
          role={userRole}
          isAuthenticated={isAuthenticated}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          userProfile={userProfile}
          logout={logout}
          navLinks={navLinks}
        />
      )}

      {isMobile && (
        <MobileTopNav
          isLoggedIn={isAuthenticated}
          onLogout={logout}
          logoSrc="/path/to/your/logo.png"
        />
      )}

      <Routes>
        <Route path="/" element={<Home showToast={showToast} />} />
        <Route path="/login" element={<Login showToast={showToast} />} />
        <Route path="/about" element={<About showToast={showToast} />} />
        <Route path="/contact" element={<Contact showToast={showToast} />} />
        <Route
          path="/request"
          element={<CreateRequest showToast={showToast} />}
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
            >
              <TicketListPage showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
              onlyAuth
            >
              <NewTicket showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/session/:sessionId"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
              onlyAuth
            >
              <TicketSession showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
            >
              <ProjectsList showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
            >
              <ProjectDetails showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
            >
              <Dashboard showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["admin"]}
            >
              <AdminPanel showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
            >
              <RequestList showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:requestId"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
            >
              <RequestPage showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin-panel"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["superadmin"]}
            >
              <SuperAdminPanel showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isMobile ? (
        <MobileBottomNav
          activePage={activePage}
          setPage={setPage}
          navItems={navLinks}
        />
      ) : (
        <Footer navLinks={navLinks} />
      )}
    </>
  );
}

export default Router;
