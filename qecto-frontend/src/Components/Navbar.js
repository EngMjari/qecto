import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { Navbar as BSNavbar, Nav, Container, Dropdown } from "react-bootstrap";
import logo from "../assets/logo.png";

export default function Navbar() {
  const BASE_URL = 'http://192.168.1.101:8000';
  const { isAuthenticated, logout, userProfile } = useContext(AuthContext);

  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // اگر کلیک خارج از منو بود، منو بسته شود
      if (!event.target.closest(".navbar")) {
        setExpanded(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <BSNavbar
      fixed="top"
      style={{ backgroundColor: "#002a3a" }}
      variant="dark"
      expand="lg"
      dir="rtl"
      className="px-3"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* برند سمت راست */}
        <BSNavbar.Brand as={Link} to="/" className="order-1 ">
          <img
            src={logo}
            alt="لوگو شرکت"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <span
            className="px-1 d-none d-lg-inline"
            style={{ fontWeight: "bold", fontSize: "1rem", color: "#ff5700" }}
          >
            ککتوسازه هیرکاسب
          </span>
        </BSNavbar.Brand>

        {/* لینک‌ها وسط */}
        <BSNavbar.Collapse id="responsive-navbar-nav" className="order-2">
          <Nav className="mx-auto text-center" onClick={handleNavClick}>
            <Nav.Link as={Link} to="/" className="px-3">
              خانه
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="px-3">
              درباره ما
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" className="px-3">
              تماس با ما
            </Nav.Link>
          </Nav>
        </BSNavbar.Collapse>

        {/* ناحیه کاربری سمت چپ */}
        <BSNavbar.Toggle
          className="mx-1 d-flex d-lg-none order-3"
          aria-controls="responsive-navbar-nav"
        />

        <div className="mx-1 me-auto d-flex align-items-center order-4">
          {!isAuthenticated ? (
            <Nav.Link
              as={Link}
              to="/login"
              className="px-3 loginBtn"
              onClick={handleNavClick}
            >
              ورود
            </Nav.Link>
          ) : (
            <Dropdown align="start" className="no-hover">
              <Dropdown.Toggle
                as="div"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    userProfile?.image
                      ? `${BASE_URL}/${userProfile.image}`
                      : `${BASE_URL}/media/profile_images/default.png`
                  }
                  alt="User"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-start text-center">
                <Dropdown.Item as={Link} to="/dashboard" onClick={handleNavClick}>
                  پنل کاربری
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => { handleLogout(); handleNavClick(); }} className="text-danger">
                  خروج
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </Container>
    </BSNavbar>
  );
}
