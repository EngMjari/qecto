import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { createSupervisionRequest, fetchProjects } from "../../api";

const supervisionTypes = [
  { value: "", label: "انتخاب کنید..." },
  { value: "architecture", label: "نظارت معماری" },
  { value: "civil", label: "نظارت عمران" },
  { value: "coordinator", label: "ناظر هماهنگ‌کننده" },
  { value: "mechanical", label: "نظارت مکانیک" },
  { value: "electrical", label: "نظارت برق" },
];

function SupervisionRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    project: "",
    project_name: "",
    supervision_type: "",
    area: "",
    building_area: "",
    permit_number: "",
    location: null,
    description: "",
    attachments: [],
    showNewProjectForm: false,
  });

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      setFormData((prev) => ({ ...prev, location }));
      setError(null);
    }
  }, [location]);

  useEffect(() => {
    if (!user) return;
    setLoadingProjects(true);
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setLoadingProjects(false);
      })
      .catch((err) => {
        setProjects([]);
        setLoadingProjects(false);
        setError(err.response?.data?.detail || "خطا در بارگذاری پروژه‌ها.");
      });
  }, [user]);

  const handleFileChange = (update) => {
    setFormData((prev) => ({
      ...prev,
      attachments:
        typeof update === "function"
          ? Array.isArray(update(prev.attachments))
            ? update(prev.attachments)
            : []
          : Array.isArray(update)
          ? update
          : [],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNewProjectForm = () => {
    setFormData((prev) => ({
      ...prev,
      showNewProjectForm: !prev.showNewProjectForm,
      project: "",
      project_name: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    if (!user) {
      setError("لطفاً ابتدا وارد حساب کاربری خود شوید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.project && !formData.project_name.trim()) {
      setError("لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.showNewProjectForm && !formData.project_name.trim()) {
      setError("لطفاً عنوان پروژه جدید را وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.supervision_type) {
      setError("لطفاً نوع نظارت را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.building_area || Number(formData.building_area) <= 0) {
      setError("لطفاً مساحت بنا معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.area && Number(formData.area) <= 0) {
      setError("لطفاً مساحت زمین معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (Array.isArray(formData.attachments)) {
      const titles = formData.attachments.map((a) => a.title?.trim() || "");
      if (
        titles.length !== formData.attachments.length ||
        titles.includes("")
      ) {
        setError("هر پیوست باید یک عنوان معتبر داشته باشد.");
        setLoadingSubmit(false);
        return;
      }
    }

    setError(null);

    const payload = {
      supervision_type: formData.supervision_type,
      description: formData.description,
      building_area: Number(formData.building_area),
      attachments: formData.attachments,
    };

    if (formData.area) {
      payload.area = Number(formData.area);
    }
    if (formData.permit_number) {
      payload.permit_number = formData.permit_number;
    }
    if (formData.location?.lat && formData.location?.lng) {
      payload.location_lat = formData.location.lat;
      payload.location_lng = formData.location.lng;
    }
    if (formData.project && !formData.showNewProjectForm) {
      payload.project = formData.project;
    } else if (formData.project_name) {
      payload.project_name = formData.project_name.trim();
    }

    try {
      console.log("Payload:", payload);
      const result = await createSupervisionRequest(payload);
      alert("درخواست نظارت با موفقیت ارسال شد!");
      setFormData({
        project: "",
        project_name: "",
        supervision_type: "",
        area: "",
        building_area: "",
        permit_number: "",
        location: null,
        description: "",
        attachments: [],
        showNewProjectForm: false,
      });
      if (onSubmit) onSubmit(result);
    } catch (err) {
      let detail = "خطای ناشناخته";
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          detail = err.response.data.detail;
        } else if (
          err.response.data.non_field_errors &&
          Array.isArray(err.response.data.non_field_errors)
        ) {
          detail = err.response.data.non_field_errors[0];
        } else if (err.response.data.supervision_type) {
          detail = err.response.data.supervision_type[0];
        } else {
          detail = JSON.stringify(err.response.data) || "خطای ناشناخته";
        }
      }
      setError(`خطا در ارسال درخواست: ${detail}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-3 border rounded shadow-sm bg-white"
    >
      <style>
        {`
          .custom-select {
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          .custom-select:focus {
            border-color: #0056b3;
            box-shadow: 0 0 5px rgba(0,123,255,0.5);
            outline: none;
          }
        `}
      </style>
      <h5 className="mb-3 text-primary">درخواست نظارت</h5>

      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>انتخاب پروژه</Form.Label>
            {loadingProjects ? (
              <div>
                <Spinner animation="border" size="sm" /> در حال بارگذاری
                پروژه‌ها...
              </div>
            ) : (
              <Form.Select
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                disabled={formData.showNewProjectForm}
                className="custom-select"
              >
                <option value="">انتخاب کنید...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button
            variant="outline-primary"
            onClick={toggleNewProjectForm}
            className="w-100"
          >
            {formData.showNewProjectForm
              ? "لغو ایجاد پروژه"
              : "ایجاد پروژه جدید"}
          </Button>
        </Col>
      </Row>

      {formData.showNewProjectForm && (
        <Form.Group className="mb-3">
          <Form.Label>عنوان پروژه جدید</Form.Label>
          <Form.Control
            type="text"
            name="project_name"
            value={formData.project_name}
            onChange={handleInputChange}
            placeholder="نام پروژه جدید را وارد کنید"
            required
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>نوع نظارت</Form.Label>
        <Form.Select
          name="supervision_type"
          value={formData.supervision_type}
          onChange={handleInputChange}
          className="custom-select"
          required
        >
          {supervisionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>مساحت زمین (متر مربع)</Form.Label>
        <Form.Control
          type="number"
          name="area"
          value={formData.area}
          onChange={handleInputChange}
          placeholder="مثلاً 1000"
          min={0}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>مساحت بنا (متر مربع)</Form.Label>
        <Form.Control
          type="number"
          name="building_area"
          value={formData.building_area}
          onChange={handleInputChange}
          placeholder="مثلاً 500"
          min={0}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>شماره پروانه</Form.Label>
        <Form.Control
          type="text"
          name="permit_number"
          value={formData.permit_number}
          onChange={handleInputChange}
          placeholder="شماره پروانه را وارد کنید"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>موقعیت ملک</Form.Label>
        {formData.location ? (
          <div className="p-2 border rounded bg-light text-success">
            نقطه انتخاب شده: Φ: {formData.location.lat.toFixed(6)}، λ:{" "}
            {formData.location.lng.toFixed(6)}
          </div>
        ) : (
          <div className="p-2 border rounded bg-light text-danger">
            هنوز موقعیتی انتخاب نشده است.
          </div>
        )}
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
        <p className="text-muted">
          مدارک مورد نیاز: نقشه‌های معماری، پروانه ساخت (اختیاری).
        </p>
        <FileUploadTable
          files={formData.attachments}
          onChange={handleFileChange}
        />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        variant="primary"
        type="submit"
        disabled={loadingProjects || loadingSubmit}
      >
        {loadingSubmit ? (
          <>
            <Spinner animation="border" size="sm" /> در حال ارسال...
          </>
        ) : (
          "ارسال درخواست"
        )}
      </Button>
    </Form>
  );
}

export default SupervisionRequestForm;
