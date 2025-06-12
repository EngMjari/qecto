import axiosInstance from "../utils/axiosInstance";

export const createSupervisionRequest = async (formValues) => {
  try {
    if (!formValues.project && !formValues.project_name) {
      throw new Error(
        "لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید."
      );
    }
    if (!formValues.supervision_type) {
      throw new Error("نوع نظارت اجباری است.");
    }
    if (!formValues.building_area || formValues.building_area <= 0) {
      throw new Error("مساحت بنا اجباری است و باید بیشتر از صفر باشد.");
    }
    if (formValues.attachments && Array.isArray(formValues.attachments)) {
      const titles = formValues.attachments.map(
        (a) => a.title?.toLowerCase() || ""
      );
      if (titles.length !== formValues.attachments.length) {
        throw new Error("هر پیوست باید یک عنوان داشته باشد.");
      }
    }

    const formData = new FormData();
    if (formValues.project && formValues.project !== "create_new") {
      formData.append("project", formValues.project);
    } else if (formValues.project_name) {
      formData.append("project_name", formValues.project_name);
    }
    formData.append("supervision_type", formValues.supervision_type);
    if (formValues.description) {
      formData.append("description", formValues.description);
    }
    if (formValues.area) {
      formData.append("area", formValues.area);
    }
    if (formValues.building_area) {
      formData.append("building_area", formValues.building_area);
    }
    if (formValues.permit_number) {
      formData.append("permit_number", formValues.permit_number);
    }
    if (formValues.location_lat) {
      formData.append("location_lat", formValues.location_lat);
    }
    if (formValues.location_lng) {
      formData.append("location_lng", formValues.location_lng);
    }

    if (Array.isArray(formValues.attachments)) {
      formValues.attachments.forEach(({ file, title }) => {
        formData.append("attachments", file);
        formData.append("titles", title || "");
      });
    }

    const response = await axiosInstance.post(
      "/api/supervision/requests/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("خطا در ثبت درخواست نظارت:", error);
    if (error.response) {
      console.error("Error data:", error.response.data);
    }
    throw error;
  }
};
