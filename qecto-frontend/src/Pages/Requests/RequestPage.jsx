import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import ProjectDetails from "./ProjectDetails";
import ProjectDescription from "./ProjectDescription";
import MapView from "./MapView";
import TabsManager from "./TabsManager";
import PreviewModal from "./PreviewModal";
import { fetchRequestDetails } from "../../api/projectsApi";
import {
  getTicketSessionsBySurveyRequest,
  getTicketSessionsByEvaluationRequest,
} from "../../api/ticketsApi";

function RequestPage() {
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [adminFiles, setAdminFiles] = useState([]);
  const [ticketFiles, setTicketFiles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchRequestDetails(id);
        const req = res.data;
        setProjectData(req);
        const allFiles = req.attachments || [];
        setUserFiles(
          allFiles.filter((file) => file.uploaded_by === req.project.owner.id)
        );
        setAdminFiles(
          allFiles.filter((file) => file.uploaded_by !== req.project.owner.id)
        );

        // بلافاصله بعد از گرفتن projectData، سشن‌های مربوط به تیکت‌ها را هم بگیر
        if (req.request_type === "survey") {
          const ticketRes = await getTicketSessionsBySurveyRequest(req.id);
          const data = Array.isArray(ticketRes.data.results)
            ? ticketRes.data.results
            : [];
          setSessions(data);
          console.log("Session data : ", data);
        } else if (
          req.request_type === "expert" ||
          req.request_type === "evaluation"
        ) {
          const ticketRes = await getTicketSessionsByEvaluationRequest(req.id);
          const data = Array.isArray(ticketRes.data.results)
            ? ticketRes.data.results
            : [];
          setSessions(data);
          console.log("Session data : ", data);
        }
      } catch (err) {
        console.error("خطا در بارگذاری درخواست:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-lg">در حال بارگذاری...</span>
      </div>
    );
  }

  if (!projectData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div
      dir="rtl"
      className="bg-gray-100 min-h-screen font-sans page-content"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 h-48 w-full absolute top-0 right-0"></div>
      <div className="container mx-auto p-4 md:p-8 relative">
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <ProjectDetails project={projectData} />
            <ProjectDescription description={projectData.description} />
            <MapView
              lat={projectData.location_lat}
              lng={projectData.location_lng}
            />
          </div>
          <div className="lg:col-span-2">
            <TabsManager
              userFiles={userFiles}
              adminFiles={adminFiles}
              sessions={sessions}
              setSessions={setSessions}
              ticketFiles={ticketFiles}
              setTicketFiles={setTicketFiles}
              requestId={projectData.id}
              requestType={projectData.request_type}
              handlePreview={handlePreview}
              currentUserId={projectData.project.owner.id}
            />
          </div>
        </main>
      </div>
      <PreviewModal
        open={previewOpen}
        file={previewFile}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

export default RequestPage;
