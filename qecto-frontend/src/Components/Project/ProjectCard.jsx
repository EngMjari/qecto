import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";

const TYPE_MAP = {
  survey: "نقشه‌برداری",
  deed: "دریافت سند",
  expert: "کارشناس",
  supervision: "نظارت",
  execution: "اجرا",
};

const STATUS_MAP = {
  pending: "در انتظار ارجاع",
  assigned: "ارجاع‌شده",
  rejected: "رد شده",
  in_progress: "در حال انجام",
  completed: "اتمام‌یافته",
};

const STATUS_COLORS = {
  pending: "#ffc107",
  assigned: "#0dcaf0",
  rejected: "#dc3545",
  in_progress: "#17a2b8",
  completed: "#28a745",
};

const ProjectCard = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`} className="text-decoration-none">
      <div
        className="project-card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between"
        style={{
          transition: "all 0.3s ease",
          border: "1px solid #eee",
        }}
      >
        <div>
          <h5
            className="fw-bold text-dark mb-2"
            style={{
              fontSize: "1.05rem",
              WebkitLineClamp: 2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.5em",
            }}
          >
            {project.title || "بدون عنوان"}
          </h5>

          <p
            className="text-muted small mb-2"
            style={{
              WebkitLineClamp: 3,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "3.6em",
            }}
          >
            {project.description || "بدون توضیحات"}
          </p>

          {/* نوع پروژه‌ها */}
          <div className="d-flex flex-wrap gap-2 mt-2">
            {project.types?.map((type) => (
              <Badge
                key={type}
                bg=""
                style={{
                  backgroundColor: "#ff5700",
                  color: "#fff",
                  fontSize: "0.7rem",
                  padding: "0.4em 0.8em",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
              >
                {TYPE_MAP[type] || type}
              </Badge>
            ))}
          </div>
        </div>

        {/* وضعیت و دکمه */}
        {/* وضعیت و دکمه */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            <span
              className="badge rounded-pill text-white fw-bold me-2"
              style={{
                backgroundColor: STATUS_COLORS[project.status] || "#6c757d",
                fontSize: "0.75rem",
                padding: "0.4em 0.8em",
              }}
            >
              {STATUS_MAP[project.status] || project.status}
            </span>

            {/* نمایش نام ارجاع‌شونده اگر پروژه assigned است */}
            {/* {project.status === "assigned" && project.assigned_to?.full_name && (
              <span
                className="text-muted small"
                style={{
                  fontSize: "0.75rem",
                  marginRight: "0.5rem",
                }}
              >
                به: <strong>{project.assigned_to.full_name}</strong>
              </span>
            )} */}
          </div>

          <span
            className="btn btn-sm"
            style={{
              backgroundColor: "#ff5700",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.75rem",
              padding: "0.4em 0.9em",
              borderRadius: "8px",
            }}
          >
            مشاهده
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
