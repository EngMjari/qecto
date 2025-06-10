import axiosInstance from "../utils/axiosInstance";

export const fetchSiteConfig = () => {
  return axiosInstance.get("/api/site/config/");
};
