import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { createTicket } from "../../api/ticketsApi";
import FileUploadTable from "../FileUpload/FileUploadTable.jsx";

const TicketCreateForm = ({ projects = [], onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [attachments, setAttachments] = useState([]); // اضافه شد

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("all");
  const [availableRequests, setAvailableRequests] = useState([]);

  useEffect(() => {
    const selectedProject = projects.find((p) => p.id.toString() === selectedProjectId);
    setAvailableRequests(selectedProject?.requests || []);
    setSelectedRequestId("all");
  }, [selectedProjectId, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if (selectedProjectId) {
        formData.append("related_project", selectedProjectId);
        if (selectedRequestId !== "all") {
          const req = availableRequests.find((r) => r.id.toString() === selectedRequestId);
          if (req) {
            if (req.type === "survey") {
              formData.append("related_survey", selectedRequestId);
            } else if (req.type === "expert") {
              formData.append("related_expert", selectedRequestId);
            }
          }
        }
      }

      // اضافه کردن فایل‌ها به فرم دیتا
      attachments.forEach(({ file, title }, index) => {
        formData.append(`attachments[${index}][file]`, file);
        formData.append(`attachments[${index}][title]`, title);
      });

      // توجه: createTicket باید قابلیت ارسال FormData و multipart/form-data را داشته باشد
      await createTicket(formData);

      setSuccessMsg("تیکت با موفقیت ارسال شد.");
      setTitle("");
      setDescription("");
      setSelectedProjectId("");
      setSelectedRequestId("all");
      setAvailableRequests([]);
      setAttachments([]);

      if (onSuccess) onSuccess();
    } catch (err) {
  if (err.response && err.response.data) {
    const data = err.response.data;

    if (data.non_field_errors && data.non_field_errors.length > 0) {
      setError(data.non_field_errors[0]);
    } else if (typeof data === "string") {
      setError(data);
    } else {
      setError("خطا در ارسال تیکت. لطفاً ورودی‌ها را بررسی کنید.");
    }
  } else {
    setError("خطا در ارتباط با سرور. دوباره تلاش کنید.");
  }
} finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h4 className="mb-4 text-end text-primary">ارسال تیکت جدید</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form.Group className="mb-3 text-end">
        <Form.Label>پروژه (اختیاری)</Form.Label>
        <Form.Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
          <option value="">تیکت عمومی (بدون پروژه)</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {selectedProjectId && (
        <Form.Group className="mb-3 text-end">
          <Form.Label>درخواست مرتبط</Form.Label>
          <Form.Select value={selectedRequestId} onChange={(e) => setSelectedRequestId(e.target.value)}>
            <option value="all">تیکت مربوط به کل پروژه</option>
            {availableRequests.map((req) => (
              <option key={req.id} value={req.id}>
                {`${req.type === "survey" ? "نقشه‌برداری" : "کارشناسی"} - ${new Date(req.created_at).toLocaleDateString("fa-IR")}`}
              </option>
            ))}
          </Form.Select>
          {availableRequests.length === 0 && <div className="text-muted small mt-1">درخواستی برای این پروژه ثبت نشده است.</div>}
        </Form.Group>
      )}

      <Form.Group className="mb-3 text-end">
        <Form.Label>عنوان تیکت</Form.Label>
        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: مشکل در ورود به حساب" required />
      </Form.Group>

      <Form.Group className="mb-3 text-end">
        <Form.Label>توضیحات تیکت</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات کامل مشکل یا درخواست شما..."
          required
        />
      </Form.Group>

      <Form.Group className="mb-3 text-end">ش
        <Form.Label>فایل‌های پیوست (اختیاری)</Form.Label>
        <FileUploadTable attachments={attachments} onFileChange={setAttachments} />
      </Form.Group>

      <div className="text-end">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "ارسال تیکت"}
        </Button>
      </div>
    </Form>
  );
};

export default TicketCreateForm;
