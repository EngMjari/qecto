import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Spinner, Alert, Form } from "react-bootstrap";
import RequestDetails from "./Components/RequestsDetails";
import RequestDescription from "./Components/RequestDescription";
import MapView from "./Components/MapView";
import TabsManager from "./Components/TabsManager";
import PreviewModal from "./Components/PreviewModal";
import FileUploadTable from "../../Components/FileUpload/FileUploadTable";
import {
  fetchRequestDetail,
  getTicketSessionsByRequest,
  uploadAdminAttachment,
} from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

function RequestPage() {
  const { requestId } = useParams();
  const { user, isAdmin } = useAuth();
  const [requestData, setRequestData] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [adminFiles, setAdminFiles] = useState([]);
  const [ticketFiles, setTicketFiles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [adminUploads, setAdminUploads] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchRequestDetail(requestId);
        const req = {
          id: res.id,
          title: res.project_title,
          status: res.status,
          createAt:
            new Date(res.created_at).toLocaleDateString("fa-IR") || "نامشخص",
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
          tracking_code: res.tracking_code,
        };
        setRequestData(req);

        const allFiles = req.attachments || [];
        const ownerId =
          typeof req.owner === "object" ? req.owner.id : req.owner;
        setUserFiles(
          allFiles.filter((file) => {
            const uploadedBy =
              typeof file.uploaded_by === "object"
                ? file.uploaded_by.id
                : file.uploaded_by;
            return uploadedBy === ownerId;
          })
        );
        setAdminFiles(
          allFiles.filter((file) => {
            const uploadedBy =
              typeof file.uploaded_by === "object"
                ? file.uploaded_by.id
                : file.uploaded_by;
            return uploadedBy !== ownerId;
          })
        );

        const ticketRes = await getTicketSessionsByRequest(
          req.id,
          req.request_type
        );
        const data = Array.isArray(ticketRes.results) ? ticketRes.results : [];
        setSessions(data);
      } catch (err) {
        console.error("خطا در بارگذاری درخواست:", err);
        setError("خطا در بارگذاری اطلاعات درخواست. لطفاً دوباره تلاش کنید.");
        toast.error("خطا در بارگذاری اطلاعات درخواست!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  const handleAdminFileChange = async (newFiles) => {
    setAdminUploads(newFiles);

    try {
      const uploadedFiles = [];
      const contentType = requestData.request_type.toLowerCase() + "project"; // مثلاً surveyproject
      for (const { file, title } of newFiles) {
        const response = await uploadAdminAttachment(
          contentType,
          requestData.id,
          file,
          title
        );
        uploadedFiles.push({
          ...response,
          uploaded_by: user?.id || response.uploaded_by,
          title: title || file.name,
        });
      }

      setAdminFiles((prev) => [...prev, ...uploadedFiles]);
      setAdminUploads([]);
      toast.success("فایل‌ها با موفقیت آپلود شدند!");
    } catch (err) {
      console.error("خطا در آپلود فایل:", err);
      const errorMsg =
        err.error ||
        err.message ||
        "خطا در آپلود فایل‌ها. لطفاً دوباره تلاش کنید.";
      toast.error(errorMsg);
    }
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="flex flex-col items-center">
          <Spinner
            animation="border"
            className="text-orange-600 mb-2"
            aria-label="در حال بارگذاری"
          />
          <span className="text-gray-600 text-lg">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen page-content  bg-gradient-to-b from-gray-50 to-orange-50 font-sans"
    >
      {error && (
        <Alert variant="danger" className="m-4 text-red-600">
          {error}
        </Alert>
      )}
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h2 className="text-blue-600 font-bold text-2xl mb-4">
          جزئیات درخواست "{requestData.title}"
        </h2>
        <main className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-1 space-y-6">
            <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300">
              <RequestDetails request={requestData} />
            </div>
            <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300">
              <RequestDescription description={requestData.description} />
            </div>
            <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300">
              <MapView
                lat={requestData.location_lat}
                lng={requestData.location_lng}
              />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {isAdmin && (
              <div className="p-4 bg-white rounded-lg shadow-lg border border-orange-400 animate-fade-in">
                <Form.Group>
                  <Form.Label className="font-bold text-gray-700">
                    آپلود فایل‌های ادمین <span className="text-red-500">*</span>
                  </Form.Label>
                  <p className="text-muted text-sm mb-3">
                    حداکثر ۱۰ فایل، هر کدام تا ۵ مگابایت (فرمت‌های مجاز: DWG،
                    DXF، XLSX، XLS، PDF، JPG، JPEG، PNG)
                  </p>
                  <div className="border border-orange-400 rounded-lg p-3 bg-orange-50">
                    <FileUploadTable
                      files={adminUploads}
                      onFileChange={handleAdminFileChange}
                    />
                  </div>
                </Form.Group>
              </div>
            )}
            <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300">
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
                currentUserId={
                  typeof requestData.owner === "object"
                    ? requestData.owner.id
                    : requestData.owner
                }
              />
            </div>
          </div>
        </main>
      </div>
      <PreviewModal
        open={previewOpen}
        file={previewFile}
        onClose={() => setPreviewOpen(false)}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RequestPage;
