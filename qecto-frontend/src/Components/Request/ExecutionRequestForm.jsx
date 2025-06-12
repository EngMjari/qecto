import React, { useEffect, useState } from "react";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { createExecutionRequest, fetchProjects } from "../../api";

function ExecutionRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    project: "",
    project_name: "",
    description: "",
    area: "",
    building_area: "",
    permit_number: "",
    location: null,
    attachments: [],
  });

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    setLoadingProjects(true);
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setLoadingProjects(false);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, project: data[0].id }));
        }
      })
      .catch(() => {
        setProjects([]);
        setLoadingProjects(false);
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
    if (name === "project" && value === "new") {
      setFormData((prev) => ({
        ...prev,
        project: value,
        project_name: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // اعتبارسنجی‌ها
    if (!formData.project && !formData.project_name.trim()) {
      setError("لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.project === "new" && !formData.project_name.trim()) {
      setError("لطفاً عنوان پروژه جدید را وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.area && Number(formData.area) <= 0) {
      setError("لطفاً مساحت زمین معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.building_area && Number(formData.building_area) <= 0) {
      setError("لطفاً مساحت بنا معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }

    setError(null);

    const payload = {
      description: formData.description,
      attachments: formData.attachments,
    };

    if (formData.area) {
      payload.area = Number(formData.area);
    }
    if (formData.building_area) {
      payload.building_area = Number(formData.building_area);
    }
    if (formData.permit_number.trim()) {
      payload.permit_number = formData.permit_number.trim();
    }
    if (formData.location?.lat && formData.location?.lng) {
      payload.location = formData.location;
    }
    if (formData.project && formData.project !== "new") {
      payload.project = formData.project;
    } else {
      payload.project_name = formData.project_name.trim();
    }

    try {
      const result = await createExecutionRequest(payload);
      alert("درخواست مجری با موفقیت ارسال شد!");
      setFormData({
        project: projects.length > 0 ? projects[0].id : "",
        project_name: "",
        description: "",
        area: "",
        building_area: "",
        permit_number: "",
        location: null,
        attachments: [],
      });
      if (onSubmit) onSubmit(result);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.message;
      setError("خطا در ارسال درخواست: " + detail);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-3 border rounded shadow-sm bg-white"
    >
      <h5 className="mb-3 text-primary">درخواست مجری</h5>

      {projects.length > 0 && (
        <Form.Group className="mb-3">
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
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.name}
                </option>
              ))}
              <option value="new">ایجاد پروژه جدید</option>
            </Form.Select>
          )}
        </Form.Group>
      )}

      {(projects.length === 0 || formData.project === "new") && (
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
        <Form.Label>مساحت زمین (متر مربع، اختیاری)</Form.Label>
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
        <Form.Label>مساحت بنا (متر مربع، اختیاری)</Form.Label>
        <Form.Control
          type="number"
          name="building_area"
          value={formData.building_area}
          onChange={handleInputChange}
          placeholder="مثلاً 500"
          min={0}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>شماره پروانه (اختیاری)</Form.Label>
        <Form.Control
          type="text"
          name="permit_number"
          value={formData.permit_number}
          onChange={handleInputChange}
          placeholder="شماره پروانه را وارد کنید"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>موقعیت ملک (اختیاری)</Form.Label>
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
        <Form.Label>توضیحات (اختیاری)</Form.Label>
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
        <Form.Label>پیوست‌ها (اختیاری)</Form.Label>
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

export default ExecutionRequestForm;
