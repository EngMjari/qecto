import React, { useContext, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthContext } from "./Context/AuthContext";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
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
import Header from "./Components/Layouts/Header";
import Footer from "./Components/Layouts/Footer";
import MobileBottomNav from "./Components/Layouts/MobileBottomNav";
import {
  HomeIcon,
  InfoIcon,
  PhoneIcon,
  UserIcon,
  SettingsIcon,
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

  // وضعیت موبایل بر اساس عرض صفحه
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // برای هر نقش، لینک‌ها با آیکون:
  const guestLinks = [
    { name: "خانه", page: "home", link: "/", Icon: HomeIcon },
    { name: "درباره ما", page: "about", link: "/about", Icon: InfoIcon },
    { name: "تماس با ما", page: "contact", link: "/contact", Icon: PhoneIcon },
  ];
  const userLinks = [
    ...guestLinks,
    { name: "پنل کاربری", page: "user", link: "/dashboard", Icon: UserIcon },
  ];
  const adminLinks = [
    ...userLinks,
    { name: "مدیریت", page: "admin", link: "/admin-panel", Icon: SettingsIcon },
  ];
  const superAdminLinks = [
    ...adminLinks,
    {
      name: "سوپر ادمین",
      page: "superadmin",
      link: "/super-admin-panel",
      Icon: SettingsIcon,
    },
  ];
  let navLinks = guestLinks;
  if (userRole === "user") navLinks = userLinks;
  if (userRole === "admin") navLinks = adminLinks;
  if (userRole === "superadmin") navLinks = superAdminLinks;

  // کنترل صفحه فعال و ناوبری موبایل
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
      {/* فقط در حالت دسکتاپ هدر و فوتر را نمایش بده */}
      {!isMobile && (
        <>
          <Header
            role={userRole}
            isAuthenticated={isAuthenticated}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            userProfile={userProfile}
            logout={logout}
            navLinks={navLinks}
          />
        </>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request" element={<CreateRequest />} />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user", "admin", "superadmin"]}
              onlyAuth={true}
            >
              <NewTicket />
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
              onlyAuth={true}
            >
              <TicketSession />
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
              <ProjectsList />
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
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user"]}
            >
              <Dashboard />
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
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user"]}
            >
              <RequestList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["user"]}
            >
              <RequestPage />
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
              <SuperAdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* در حالت موبایل فقط ناوبری پایین موبایل را نمایش بده */}
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
