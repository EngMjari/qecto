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
  Stack,
  Chip,
} from "@mui/material";
import axiosInstance from "../../utils/axiosInstance";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CommentIcon from "@mui/icons-material/Comment";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

const pageSize = 8;

const statusColors = {
  open: "#f1c40f",       // باز
  in_progress: "#1abc9c", // در حال بررسی
  resolved: "#28a745",   // پاسخ داده شده
  closed: "#6c757d",     // بسته شده
  rejected: "#dc3545",   // رد شده
};

const statusLabels = {
  open: "باز",
  in_progress: "در حال بررسی",
  resolved: "پاسخ داده شده",
  closed: "بسته شده",
  rejected: "رد شده",
};

const priorityLabels = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
};

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchTerm.trim() !== "") params.search = searchTerm.trim();

      const res = await axiosInstance.get("api/tickets/", { params });
      setTickets(res.data.results);
      setCount(res.data.count);
    } catch (error) {
      console.error("خطا در بارگذاری تیکت‌ها:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
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
        لیست تیکت‌ها ({count})
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
            <MenuItem value="open">باز</MenuItem>
            <MenuItem value="in_progress">در حال بررسی</MenuItem>
            <MenuItem value="resolved">پاسخ داده شده</MenuItem>
            <MenuItem value="closed">بسته شده</MenuItem>
            <MenuItem value="rejected">رد شده</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="جستجو بر اساس عنوان تیکت"
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
      ) : tickets.length > 0 ? (
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
            {tickets.map((ticket) => (
              <Box
                key={ticket.id}
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
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                {/* عنوان و توضیح کوتاه */}
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={1}
                    sx={{
                      WebkitLineClamp: 2,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "3em",
                      color: "#002a3a",
                    }}
                  >
                    {ticket.title || "بدون عنوان"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      WebkitLineClamp: 3,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "4.5em",
                    }}
                  >
                    {ticket.description || "بدون توضیحات"}
                  </Typography>
                </Box>

                {/* وضعیت و اولویت */}
                <Box mt={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                    <Chip
                      label={statusLabels[ticket.status] || ticket.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          statusColors[ticket.status] || "#999",
                        color: "white",
                        fontWeight: "bold",
                        width: "fit-content",
                      }}
                      icon={<PriorityHighIcon />}
                    />

                    <Chip
                      label={"اولویت: " + (priorityLabels[ticket.priority] || "-")}
                      size="small"
                      sx={{
                        backgroundColor: "#ff7f50",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Stack>

                  {/* اطلاعات بیشتر */}
                  <Typography
                    variant="caption"
                    display="flex"
                    alignItems="center"
                    color="text.secondary"
                    gap={0.5}
                  >
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    ثبت شده در: {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                  </Typography>

                  <Typography
                    variant="caption"
                    display="flex"
                    alignItems="center"
                    color="text.secondary"
                    gap={0.5}
                    mt={0.5}
                  >
                    <CommentIcon sx={{ fontSize: 16 }} />
                    تعداد پاسخ‌ها: {ticket.comment_count ?? 0}
                  </Typography>
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
        <Typography variant="body1" color="text.secondary" textAlign="center" mt={8}>
          هیچ تیکتی یافت نشد.
        </Typography>
      )}
    </Box>
  );
};

export default TicketsList;
