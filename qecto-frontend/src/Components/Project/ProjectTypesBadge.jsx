import React from "react";
import { Chip, Stack } from "@mui/material";

const TYPE_MAP = {
  survey: "نقشه‌برداری",
  deed: "دریافت سند",
  expert: "کارشناس",
  supervision: "نظارت",
  execution: "اجرا",
};

const ProjectTypesBadge = ({ types = [] }) => {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
      {types.map((type) => (
        <Chip
          key={type}
          label={TYPE_MAP[type] || type}
          size="small"
          sx={{
            background: "linear-gradient(to right, #ff5700, #e64a00)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.75rem",
            borderRadius: "16px",
            width: 100, // یا هر مقدار دلخواه مثل 120 یا 96
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            },
          }}
        />
      ))}
    </Stack>
  );
};

export default ProjectTypesBadge;
