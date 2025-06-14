import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import RequestDetails from "./Components/RequestsDetails";
import RequestDescription from "./Components/RequestDescription";
import MapView from "./Components/MapView";
import TabsManager from "./Components/TabsManager";
import PreviewModal from "./Components/PreviewModal";
import { fetchRequestDetail } from "../../api/requestsApi";
import { getTicketSessionsByRequest } from "../../api/ticketsApi";

function RequestPage() {
  const { requestId } = useParams();
  const [requestData, setRequestData] = useState(null);
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
        const res = await fetchRequestDetail(requestId);
        const req = {
          id: res.id,
          title: res.project_title,
          status: res.status,
          createAt:
            new Date(res.created_at).toLocaleDateString("fa-IR") || "date",
          assignedAdmin: res.assigned_admin,
          property_type: res.specific_fields.property_type,
          area: res.specific_fields.area,
          building_area: res.specific_fields.building_area,
          main_parcel_number: res.specific_fields.main_parcel_number,
          sub_parcel_number: res.specific_fields.sub_parcel_number,
          request_type: res.request_type,
          owner: res.owner,
          description: res.specific_fields.description || "",
          location_lat: res.specific_fields.location_lat,
          location_lng: res.specific_fields.location_lng,
          attachments: res.attachments || [],
          status_display: res.status_display,
        };
        setRequestData(req);
        const allFiles = req.attachments || [];
        setUserFiles(allFiles.filter((file) => file.uploaded_by === req.owner));
        setAdminFiles(
          allFiles.filter((file) => file.uploaded_by !== req.owner)
        );

        const ticketRes = await getTicketSessionsByRequest(
          req.id,
          req.request_type
        );
        const data = Array.isArray(ticketRes.results) ? ticketRes.results : [];
        setSessions(data);
      } catch (err) {
        console.error("خطا در بارگذاری درخواست:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

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

  if (!requestData) {
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
            <RequestDetails request={requestData} />
            <RequestDescription description={requestData.description} />
            <MapView
              lat={requestData.location_lat}
              lng={requestData.location_lng}
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
              requestId={requestData.id}
              requestType={requestData.request_type}
              handlePreview={handlePreview}
              currentUserId={requestData.owner.id}
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
