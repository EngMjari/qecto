import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import ProjectTypesBadge from "./ProjectTypesBadge";
import Inventory2Icon from "@mui/icons-material/Inventory2";

const STATUS_MAP = {
  pending: "در انتظار ارجاع",
  assigned: "ارجاع داده‌شده",
  rejected: "ردشده یا نیاز به اصلاح",
  in_progress: "در حال انجام",
  completed: "اتمام‌یافته",
};

const ProjectCard = ({ project }) => {
  return (
    <Card
      sx={{
        backgroundColor: "#fff",
        color: "#002a3a",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0, 42, 58, 0.15)",
        borderRadius: 2,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 6px 20px rgba(255, 87, 0, 0.3)",
          cursor: "pointer",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ color: "#ff5700", fontWeight: "bold" }}
        >
          {project.title || "بدون عنوان"}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, minHeight: 50, color: "#444" }}>
          {project.description || "توضیحی وجود ندارد."}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            color: "#002a3a",
            mb: 1,
          }}
        >
          وضعیت پروژه: {STATUS_MAP[project.status] || project.status}
        </Typography>

        <ProjectTypesBadge types={project.types} />

        <Stack direction="row" alignItems="center" spacing={0.5} mt={2} color="#555">
          <Inventory2Icon fontSize="small" />
          <Typography variant="body2">
            تعداد درخواست‌ها: {project.requests_count ?? 0}
          </Typography>
        </Stack>
      </CardContent>

      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: "1px solid #ff5700",
          fontSize: "0.875rem",
          fontWeight: "500",
          color: "#002a3a",
          backgroundColor: "#f7f7f7",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          textAlign: "center",
        }}
      >
        ایجاد شده در:{" "}
        {project.created_at
          ? new Date(project.created_at).toLocaleDateString("fa-IR")
          : "-"}
      </Box>
    </Card>
  );
};

export default ProjectCard;
