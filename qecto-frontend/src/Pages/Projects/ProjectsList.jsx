import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance"; // فرض می‌کنیم این فایل ساخته شده
import {
  Box,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
} from "@mui/material";
import ProjectCard from "../../Components/Project/ProjectCard";

const pageSize = 5;

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("api/projects/", { params: { page, page_size: pageSize } })
      .then((res) => {
        setProjects(res.data.results);
        setCount(res.data.count);
      })
      .catch((err) => {
        console.error("Error loading projects:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  const totalPages = Math.ceil(count / pageSize);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        color: "#002a3a",
      }}
      className="container"
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: "#ff5700",
          fontWeight: "bold",
          mb: 4,
          borderBottom: "3px solid #ff5700",
          pb: 1,
          maxWidth: "fit-content",
        }}
      >
        پروژه‌های من ({count})
      </Typography>

      {loading ? (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mt: 6,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      ) : projects.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 5,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: "bold",
                    color: "#ff5700",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#ff5700",
                    color: "#fff",
                  },
                }}
                dir="ltr"
              />
            </Box>
          )}
        </>
      ) : (
        <Typography
          variant="body1"
          sx={{ mt: 5, width: "100%", textAlign: "center" }}
        >
          پروژه‌ای یافت نشد.
        </Typography>
      )}
    </Box>
  );
};

export default ProjectsList;
