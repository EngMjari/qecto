import React, { useEffect, useState } from "react";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import axiosInstance from "../../utils/axiosInstance";

const propertyTypes = () => [
  { value: "field", label: "زمین" },
  { value: "Building", label: "ساختمان" },
  { value: "other", label: "سایر" },
];

function ExpertRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: null,
    attachments: [],
    propertyType: "",
    mainParcelNumber: "",
    subParcelNumber: "",
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

    // فقط اجازه عدد در پلاک‌ها
    if (name === "mainParcelNumber" || name === "subParcelNumber") {
      if (value === "" || /^[0-9\b]+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
    if (!formData.propertyType) {
      setError("لطفاً نوع ملک را انتخاب کنید.");
      return;
    }
    if (!formData.mainParcelNumber) {
      setError("لطفاً پلاک اصلی را وارد کنید.");
      return;
    }
    if (!formData.subParcelNumber) {
      setError("لطفاً پلاک فرعی را وارد کنید.");
      return;
    }

    setError(null);

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description || "");
      formPayload.append("location", JSON.stringify(formData.location));
      formPayload.append("property_type", formData.propertyType);
      formPayload.append("main_parcel_number", formData.mainParcelNumber);
      formPayload.append("sub_parcel_number", formData.subParcelNumber);

      if (user && user.id) {
        formPayload.append("user", user.id);
      }

      if (Array.isArray(formData.attachments)) {
        formData.attachments.forEach(({ file, title }) => {
          formPayload.append("attachments", file);
          formPayload.append("titles", title);
        });
      }

      const response = await axiosInstance.post(
        "/api/expert/request/",
        formPayload
      );

      // چون axios response.ok وجود ندارد، به جای آن باید status بررسی شود:
      if (response.status !== 201 && response.status !== 200) {
        setError(`خطا در ارسال درخواست: ${response.statusText}`);
        return;
      }

      alert("درخواست کارشناسی با موفقیت ارسال شد!");

      setFormData({
        title: "",
        description: "",
        location: null,
        attachments: [],
        propertyType: "",
        mainParcelNumber: "",
        subParcelNumber: "",
      });

      if (onSubmit) onSubmit(response.data);
    } catch (error) {
      console.error("⚠️ خطا در ارسال:", error);
      setError("خطا در ارسال درخواست: " + error.message);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-3 border rounded shadow-sm bg-white"
    >
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
        <Form.Label>نوع ملک</Form.Label>
        <Form.Select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleInputChange}
          required
        >
          {propertyTypes().map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="mainParcelNumber">
          <Form.Label>پلاک اصلی</Form.Label>
          <Form.Control
            type="text"
            name="mainParcelNumber"
            value={formData.mainParcelNumber}
            onChange={handleInputChange}
            placeholder="فقط عدد"
            required
            maxLength={10}
          />
        </Form.Group>

        <Form.Group as={Col} controlId="subParcelNumber">
          <Form.Label>پلاک فرعی</Form.Label>
          <Form.Control
            type="text"
            name="subParcelNumber"
            value={formData.subParcelNumber}
            onChange={handleInputChange}
            placeholder="فقط عدد"
            required
            maxLength={10}
          />
        </Form.Group>
      </Row>

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
