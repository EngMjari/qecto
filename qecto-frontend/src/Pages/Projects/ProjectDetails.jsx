import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProjectDetails } from "../../api/projectsApi";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProjectDetails(id).then((res) => setProject(res.data));
  }, [id]);

  if (!project) return <div className="text-white p-4">در حال بارگذاری...</div>;

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold text-orange-500">{project.title}</h1>
      <p className="mt-2">{project.description}</p>
      <p className="text-sm text-gray-300 mt-2">تاریخ ایجاد: {new Date(project.created_at).toLocaleDateString("fa-IR")}</p>
      <h2 className="text-lg font-semibold mt-4 text-orange-400">نوع پروژه‌ها:</h2>
      <ul className="list-disc ml-6 mt-2 text-sm">
        {project.types.map((type) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDetails;
