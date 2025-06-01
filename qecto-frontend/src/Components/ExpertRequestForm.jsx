import React, { useEffect, useState } from "react";
import FileUploadTable from "./FileUploadTable";
import { Form, Button, Alert } from "react-bootstrap";

function ExpertRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    mainParcelNumber: "",
    subParcelNumber: "",
    location: null,
    description: "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (update) => {
    setFormData((prev) => {
      const newAttachments = typeof update === "function" ? update(prev.attachments) : update;
      return {
        ...prev,
        attachments: newAttachments,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("لطفاً موضوع کارشناسی را وارد کنید.");
      return;
    }
    if (!formData.propertyType) {
      setError("لطفاً نوع ملک را انتخاب کنید.");
      return;
    }
    if (!formData.mainParcelNumber || !formData.subParcelNumber) {
      setError("لطفاً شماره پلاک اصلی و فرعی را وارد کنید.");
      return;
    }

    setError(null);

    try {
      const token = localStorage.getItem("access");
      const formPayload = new FormData();

      formPayload.append("title", formData.title);
      formPayload.append("propertyType", formData.propertyType);
      formPayload.append("mainParcelNumber", formData.mainParcelNumber);
      formPayload.append("subParcelNumber", formData.subParcelNumber);
      formPayload.append("description", formData.description || "");
      if (formData.location) {
        formPayload.append("location", JSON.stringify(formData.location));
      }
      if (user && user.id) {
        formPayload.append("user", user.id);
      }
      formData.attachments.forEach((file) => {
        formPayload.append("attachments", file);
      });

      const response = await fetch("http://localhost:8000/api/expert/request/", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
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
        propertyType: "",
        mainParcelNumber: "",
        subParcelNumber: "",
        location: null,
        description: "",
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
      <h5 className="mb-3 text-primary">درخواست کارشناسی ملک</h5>

      <Form.Group className="mb-3">
        <Form.Label>موضوع کارشناسی</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="مثلاً بررسی وضعیت ثبتی پلاک 45 اصلی از 12 فرعی"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>نوع ملک</Form.Label>
        <Form.Select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required>
          <option value="">انتخاب کنید</option>
          <option value="زمین">زمین</option>
          <option value="ساختمان">ساختمان</option>
          <option value="سایر">سایر</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>شماره پلاک</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            name="mainParcelNumber"
            value={formData.mainParcelNumber}
            onChange={handleInputChange}
            placeholder="پلاک اصلی (مثلاً 45)"
          />
          <Form.Control
            type="text"
            name="subParcelNumber"
            value={formData.subParcelNumber}
            onChange={handleInputChange}
            placeholder="پلاک فرعی (مثلاً 12)"
          />
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>موقعیت ملک (اختیاری)</Form.Label>
        {formData.location ? (
          <div className="p-2 border rounded bg-light text-success">
            نقطه‌ای با مختصات Φ: {formData.location.lat.toFixed(6)}، λ: {formData.location.lng.toFixed(6)} انتخاب شده است.
          </div>
        ) : (
          <div className="p-2 border rounded bg-light text-muted">
            مختصات اختیاری است، در صورت تمایل روی نقشه نقطه‌ای انتخاب کنید.
          </div>
        )}
        <input type="hidden" name="location" value={JSON.stringify(formData.location || {})} />
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
        <Form.Label>پیوست‌ها</Form.Label>
        <FileUploadTable attachments={formData.attachments} onFileChange={handleFileChange} />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button type="submit" className="btn btn-primary w-100">
        ثبت درخواست
      </Button>
    </Form>
  );
}

export default ExpertRequestForm;
