import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Pagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ProjectCard from "../../Components/Project/ProjectCard";
import axiosInstance from "../../utils/axiosInstance";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";


const pageSize = 8;

const statusColors = {
  pending: "#f1c40f", // در حال بررسی
  in_progress: "#1abc9c", // در حال انجام
  completed: "#28a745", // تکمیل شده
  incomplete: "#e67e22", // دارای نقص
  rejected: "#dc3545", // رد شده
  unknown: "#999",
};

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // گرفتن پروژه‌ها از API با فیلتر و جستجو
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchTerm.trim() !== "") params.search = searchTerm.trim();

      const res = await axiosInstance.get("api/projects/", { params });
      setProjects(res.data.results);
      setCount(res.data.count);
      console.log(res.data);
    } catch (error) {
      console.error("خطا در بارگذاری پروژه‌ها:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter, searchTerm]);

  const totalPages = Math.ceil(count / pageSize);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, md: 6 },
        py: 4,
        bgcolor: "#f2f4f5",
        minHeight: "100vh",
        fontFamily: "Vazir",
        color: "#002a3a",
      }}
    >
      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        پروژه‌های من ({count})
      </Typography>

      {/* فیلتر وضعیت و جستجو */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "center",
          mb: 4,
        }}
      >
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>فیلتر وضعیت</InputLabel>
          <Select
            value={statusFilter}
            label="فیلتر وضعیت"
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value="pending">در انتظار ارجاع</MenuItem>
            <MenuItem value="assigned">ارجاع داده‌شده</MenuItem>
            <MenuItem value="rejected">ردشده یا نیاز به اصلاح</MenuItem>
            <MenuItem value="in_progress">در حال انجام</MenuItem>
            <MenuItem value="completed">اتمام‌یافته</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="جستجو بر اساس نام پروژه"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          sx={{ minWidth: 240 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress sx={{ color: "#ff5700" }} size={50} />
        </Box>
      ) : projects.length > 0 ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {projects.map((project) => (
              <Box
                key={project.id}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <ProjectCard project={project} statusColors={statusColors} />

                {/* اطلاعات بیشتر: تاریخ و تعداد درخواست */}
                <Box
  mt={2}
  sx={{
    fontSize: 14,
    color: "#002a3a",
    borderTop: "1px solid #e0e0e0",
    pt: 2,
  }}
>
  <Typography component="div" display="flex" alignItems="center" mb={0.5}>
    <CalendarTodayIcon sx={{ fontSize: 18, color: "#888", ml: 1 }} />
    تاریخ پروژه: <strong style={{ marginRight: 4 }}>{new Date(project.created_at).toLocaleDateString("fa-IR")}</strong>
  </Typography>

  <Typography component="div" display="flex" alignItems="center" mb={0.5}>
    <DescriptionIcon sx={{ fontSize: 18, color: "#888", ml: 1 }} />
    تعداد درخواست‌ها: <strong style={{ marginRight: 4 }}>{project.request_count ?? 0}</strong>
  </Typography>

  {(project.survey || project.expert) && (
    <Typography
      component="div"
      display="flex"
      alignItems="center"
      sx={{
        fontSize: 13,
        color: "#555",
      }}
    >
      <AssignmentTurnedInIcon sx={{ fontSize: 18, color: "#888", ml: 1 }} />
      نوع درخواست:
      <Box component="span" sx={{ fontWeight: "bold", mr: 0.5 }}>
        {project.survey && " نقشه‌برداری"}
        {project.expert && project.survey && "،"}
        {project.expert && " کارشناسی"}
      </Box>
    </Typography>
  )}
</Box>

              </Box>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box mt={6} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontFamily: "Vazir",
                    fontWeight: "bold",
                    color: "#002a3a",
                    "&.Mui-selected": {
                      backgroundColor: "#ff5700",
                      color: "#fff",
                      boxShadow: "0 0 8px rgba(255,87,0,0.4)",
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" color="textSecondary" textAlign="center" mt={8}>
          هیچ پروژه‌ای ثبت نشده است.
        </Typography>
      )}
    </Box>
  );
};

export default ProjectsList;
