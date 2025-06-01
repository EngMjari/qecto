import React, { useEffect, useState } from "react";
import FileUploadTable from "./FileUploadTable";
import { Form, Button, Alert } from "react-bootstrap";
import authFetch from "../utils/authFetch";

function ExpertRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: null,
    attachments: [],
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        location,
      }));
      setError(null);
    }
  }, [location]);

  const handleFileChange = (update) => {
    setFormData((prev) => {
      const newAttachments =
        typeof update === "function" ? update(prev.attachments) : update;
      return {
        ...prev,
        attachments: newAttachments,
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location) {
      setError("لطفاً موقعیت ملک را از روی نقشه انتخاب کنید.");
      return;
    }
    if (!formData.title.trim()) {
      setError("لطفاً عنوان پروژه را وارد کنید.");
      return;
    }

    setError(null);

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description || "");
      formPayload.append("location", JSON.stringify(formData.location));
      if (user && user.id) {
        formPayload.append("user", user.id);
      }

      if (Array.isArray(formData.attachments)) {
        formData.attachments.forEach(({ file, title }) => {
          formPayload.append("attachments", file);
          formPayload.append("titles", title);
        });
      }

      const response = await authFetch("http://localhost:8000/api/expert/request/", {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }
        setError(`خطا در ارسال درخواست: ${errorData.detail || response.statusText}`);
        return;
      }

      const result = await response.json();
      alert("درخواست کارشناسی با موفقیت ارسال شد!");

      setFormData({
        title: "",
        description: "",
        location: null,
        attachments: [],
      });

      if (onSubmit) onSubmit(result);
    } catch (error) {
      console.error("⚠️ خطا در ارسال:", error);
      setError("خطا در ارسال درخواست: " + error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm bg-white">
      <h5 className="mb-3 text-primary">درخواست کارشناسی</h5>

      <Form.Group className="mb-3">
        <Form.Label>عنوان پروژه</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="عنوان پروژه کارشناسی"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>توضیحات</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="توضیحات بیشتر..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>موقعیت ملک (عرض و طول جغرافیایی)</Form.Label>
        {formData.location ? (
          <div className="p-2 border rounded bg-light text-success">
            نقطه به مختصات Φ: {formData.location.lat.toFixed(6)}، λ:{" "}
            {formData.location.lng.toFixed(6)} انتخاب شده است.
          </div>
        ) : (
          <div className="p-2 border rounded bg-light text-danger">
            هنوز موقعیتی انتخاب نشده است.
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>پیوست‌ها</Form.Label>
        <FileUploadTable
          attachments={formData.attachments}
          onFileChange={handleFileChange}
        />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button type="submit" className="btn btn-primary w-100">
        ارسال درخواست
      </Button>
    </Form>
  );
}

export default ExpertRequestForm;
