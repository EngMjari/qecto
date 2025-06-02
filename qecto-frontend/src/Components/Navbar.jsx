import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  Button,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";

import { AuthContext } from "../Context/AuthContext";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  const { isAuthenticated, userRole, logout, userProfile } = useContext(AuthContext);
  const [anchorRoleEl, setAnchorRoleEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  // لینک‌های اصلی نوبار (عمومی)
  const mainLinks = [
    { text: "خانه", icon: <HomeIcon />, path: "/" },
    { text: "درباره ما", icon: <InfoIcon />, path: "/about" },
    { text: "تماس با ما", icon: <ContactMailIcon />, path: "/contact" },
  ];

  // لینک‌های نقش کاربری برای منوی آواتار و دراور
  const roleLinks = [];
  if (isAuthenticated) {
    if (userRole === "user") {
      roleLinks.push({ text: "داشبورد", icon: <DashboardIcon />, path: "/dashboard" });
    }
    if (userRole === "admin") {
      roleLinks.push({ text: "پنل ادمین", icon: <AdminPanelSettingsIcon />, path: "/admin-panel" });
    }
    if (userRole === "superadmin") {
      roleLinks.push({ text: "پنل سوپرادمین", icon: <SupervisedUserCircleIcon />, path: "/super-admin-panel" });
    }
  }

  // باز و بسته کردن منوی رول کنار آواتار
  const handleRoleMenuOpen = (event) => {
    setAnchorRoleEl(event.currentTarget);
  };

  const handleRoleMenuClose = () => {
    setAnchorRoleEl(null);
  };

  const handleLogout = () => {
    logout();
    handleRoleMenuClose();
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#002a3a",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          fontFamily: "'Vazir', sans-serif",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
          {/* سمت راست: لوگو و نام شرکت */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img src={logo} alt="لوگو" style={{ height: 40 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  color: "#ff5700",
                  fontWeight: "bold",
                  mr: 1,
                  userSelect: "none",
                }}
              >
                ککتوسازه هیرکاسب
              </Typography>
            </Box>
          </Box>

          {/* لینک‌های اصلی همیشه وسط */}
          {!isMobile && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                gap: 3,
                alignItems: "center",
              }}
            >
              {mainLinks.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{
                    fontWeight: 500,
                    "&:hover": { color: "#ff5700" },
                    textTransform: "none",
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* سمت چپ دسکتاپ: دکمه ورود یا آواتار */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!isAuthenticated && (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="secondary"
                  sx={{
                    borderColor: "#ff5700",
                    color: "#ff5700",
                    "&:hover": {
                      backgroundColor: "#ff5700",
                      color: "#002a3a",
                      borderColor: "#ff5700",
                    },
                    textTransform: "none",
                  }}
                >
                  ورود
                </Button>
              )}

              {isAuthenticated && (
                <Box>
                  <Tooltip title={userProfile?.name || "کاربر"}>
                    <IconButton
                      onClick={handleRoleMenuOpen}
                      size="small"
                      sx={{ padding: 0 }}
                      aria-controls={Boolean(anchorRoleEl) ? "account-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={Boolean(anchorRoleEl) ? "true" : undefined}
                    >
                      <Avatar src={userProfile?.image} alt={userProfile?.name} sx={{ width: 40, height: 40 }} />
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#fff",
                          paddingX: 2,
                        }}
                      >
                        {userProfile?.name || "کاربر"}
                      </Typography>
                    </IconButton>
                  </Tooltip>

                  {/* اینجا منوی دراپ‌دان را اضافه کن */}
                  <Menu
                    anchorEl={anchorRoleEl}
                    open={Boolean(anchorRoleEl)}
                    onClose={handleRoleMenuClose}
                    PaperProps={{
                      sx: {
                        bgcolor: "#002a3a",
                        color: "#fff",
                        mt: 1.5,
                        minWidth: 180,
                        fontFamily: "'Vazir', sans-serif",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    {roleLinks.map((item) => (
                      <MenuItem
                        key={item.text}
                        component={Link}
                        to={item.path}
                        onClick={handleRoleMenuClose}
                        sx={{
                          "&:hover": {
                            color: "#ff5700",
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                      </MenuItem>
                    ))}
                    <Divider sx={{ bgcolor: "#ff5700", my: 0.5 }} />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        "&:hover": { color: "red", backgroundColor: "transparent" },
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
                        <ExitToAppIcon />
                      </ListItemIcon>
                      خروج
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          )}

          {/* اینجا آیکون همبرگر موبایل را همیشه گوشه راست قرار میدهیم */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="باز کردن منو"
              sx={{
                color: drawerOpen ? "#fff" : "#002a3a",
                border: `2px solid ${drawerOpen ? "#fff" : "#002a3a"}`,
                position: "fixed",
                right: 25,
                bottom: 20,
                // transform: "translateY(-50%)",
                "&:hover": {
                  backgroundColor: drawerOpen ? "#fff" : "#002a3a",
                  color: "#ff5700",
                  borderColor: "#ff5700",
                },
              }}
            >
              {drawerOpen ? <CloseIcon sx={{ fontSize: 25 }} /> : <MenuIcon sx={{ fontSize: 25 }} />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* دراور موبایل: لینک‌های اصلی + دکمه ورود + لینک‌های نقش + خروج */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        transitionDuration={700}
        PaperProps={{
          sx: {
            bgcolor: "#002a3a",
            color: "#fff",
            width: 250,
            pt: 8,
            pr: 2,
            overflowX: "hidden",
            overflowY: "auto",
            fontFamily: "'Vazir', sans-serif",
          },
        }}
      >
        <List>
          {mainLinks.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={toggleDrawer}
              sx={{
                color: "#fff",

                "&:hover": {
                  color: "#ff5700",
                  transition: "scale 500ms ease-in",
                  scale: 1.1,
                  backgroundColor: "transparent",
                  borderRight: "2px solid #ff5700",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 40,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.2) rotate(5deg)",
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                sx={{
                  textAlign: "start",
                }}
                primary={item.text}
              />
            </ListItem>
          ))}

          {!isAuthenticated && (
            <ListItem
              button
              component={Link}
              to="/login"
              onClick={toggleDrawer}
              sx={{
                color: "rgba(38, 222, 129,1.0)",
                "&:hover": {
                  color: "#ff5700",
                  transition: "scale 500ms ease-in",
                  scale: 1.1,
                  borderRight: "2px solid #ff5700",
                  backgroundColor: "transparent",
                },
                py: 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 40,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.2) rotate(5deg)",
                  },
                }}
              >
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText
                sx={{
                  textAlign: "start",
                }}
                primary="ورود"
              />
            </ListItem>
          )}

          {isAuthenticated && (
            <>
              <Divider sx={{ bgcolor: "#ff5700", my: 1 }} />
              {roleLinks.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer}
                  sx={{
                    color: "#fff",
                    "&:hover": {
                      color: "#ff5700",
                      transition: "scale 500ms ease-in",
                      scale: 1.1,
                      borderRight: "2px solid #ff5700",
                      backgroundColor: "transparent",
                    },
                    py: 1.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: 40,
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.2) rotate(5deg)",
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      textAlign: "start",
                    }}
                    primary={item.text}
                  />
                </ListItem>
              ))}

              <Divider sx={{ bgcolor: "#ff5700", my: 1 }} />

              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  color: "red",
                  "&:hover": {
                    color: "#ff5700",
                    cursor: "pointer",
                    transition: "scale 500ms ease-in",
                    scale: 1.1,
                    borderRight: "2px solid #ff5700",
                    backgroundColor: "transparent",
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 40,
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.2) rotate(5deg)",
                    },
                  }}
                >
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    textAlign: "start",
                    color: "inherit",
                  }}
                  primary="خروج"
                />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
