import axiosInstance from "../utils/axiosInstance";

export const fetchProjects = () => axiosInstance.get("/api/projects");
export const fetchProjectDetails = (id) => axiosInstance.get(`/api/projects/${id}/`);
