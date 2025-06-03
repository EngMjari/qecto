import React from "react";
import { Chip, Stack } from "@mui/material";

const ProjectTypesBadge = ({ types = [] }) => {
  const STATUS_MAP = {
  pending: "در انتظار ارجاع",
  assigned: "ارجاع داده‌شده",
  rejected: "ردشده یا نیاز به اصلاح",
  in_progress: "در حال انجام",
  completed: "اتمام‌یافته",
};

const TYPE_MAP = {
  survey: "نقشه‌برداری",
  deed: "دریافت سند",
  expert: "کارشناس",
  supervision: "نظارت",
  execution: "اجرا",
};

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
      {types.map((type) => (
        <Chip
          key={type}
          label={TYPE_MAP[type] || type}
          size="small"
          sx={{
            bgcolor: "#ff5700",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        />
      ))}
    </Stack>
  );
};

export default ProjectTypesBadge;
