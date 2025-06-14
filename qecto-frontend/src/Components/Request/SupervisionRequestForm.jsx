import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { createSupervisionRequest, fetchProjects } from "../../api";
import { toast } from "react-toastify";

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
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, project: data[0].id }));
        }
      })
      .catch((err) => {
        setProjects([]);
        setError(err.response?.data?.detail || "خطا در بارگذاری پروژه‌ها.");
      })
      .finally(() => {
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
      const result = await createSupervisionRequest(payload);
      toast.success("درخواست نظارت با موفقیت ارسال شد!");
      setFormData({
        project: projects.length > 0 ? projects[0].id : "",
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
      className="p-3 border border-gray-300 rounded-lg shadow-sm bg-white"
    >
      <h5 className="mb-3 text-blue-600">درخواست نظارت</h5>

      {error && (
        <Alert variant="danger" className="mb-3 text-red-600">
          {error}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>
              انتخاب پروژه <span className="text-red-500">*</span>
            </Form.Label>
            {loadingProjects ? (
              <div className="flex items-center">
                <Spinner animation="border" size="sm" className="ml-2" />
                در حال بارگذاری پروژه‌ها...
              </div>
            ) : (
              <Form.Select
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                disabled={formData.showNewProjectForm}
                required
                className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundPosition: "left 0.75rem center",
                }}
              >
                <option value="">انتخاب کنید...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        </Col>
        <Col md={4} className="flex items-end">
          <Button
            className="!border-2 !border-[#ff6f00] w-100 !text-[#ff6f00] rounded-lg py-2 px-4 text-base hover:!bg-[#f97316] hover:!text-white transition-all duration-300 !bg-transparent"
            onClick={toggleNewProjectForm}
          >
            {formData.showNewProjectForm
              ? "لغو ایجاد پروژه"
              : "ایجاد پروژه جدید"}
          </Button>
        </Col>
      </Row>

      {formData.showNewProjectForm && (
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>
                عنوان پروژه جدید <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                placeholder="نام پروژه جدید را وارد کنید"
                required
                className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>
              نوع نظارت <span className="text-red-500">*</span>
            </Form.Label>
            <Form.Select
              name="supervision_type"
              value={formData.supervision_type}
              onChange={handleInputChange}
              required
              className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundPosition: "left 0.75rem center",
              }}
            >
              {supervisionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={formData.building_area ? 6 : 12}>
          <Form.Group>
            <Form.Label>مساحت زمین (متر مربع، اختیاری)</Form.Label>
            <Form.Control
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="مثلاً 1000"
              min={0}
              className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            />
          </Form.Group>
        </Col>
        {formData.building_area && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>مساحت بنا (متر مربع، اجباری)</Form.Label>
              <Form.Control
                type="number"
                name="building_area"
                value={formData.building_area}
                onChange={handleInputChange}
                placeholder="مثلاً 500"
                min={0}
                required
                className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>شماره پروانه (اختیاری)</Form.Label>
            <Form.Control
              type="text"
              name="permit_number"
              value={formData.permit_number}
              onChange={handleInputChange}
              placeholder="شماره پروانه را وارد کنید"
              className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>موقعیت ملک (اختیاری)</Form.Label>
            {formData.location ? (
              <div className="p-2 border border-gray-300 rounded-lg bg-gray-50">
                نقطه انتخاب شده: Φ:{" "}
                <span className="text-orange-600">
                  {formData.location.lat.toFixed(6)}
                </span>
                , λ:{" "}
                <span className="text-orange-600">
                  {formData.location.lng.toFixed(6)}
                </span>
              </div>
            ) : (
              <div className="p-2 border border-gray-300 rounded-lg bg-gray-50 text-red-600">
                هنوز موقعیتی انتخاب نشده است.
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>توضیحات (اختیاری)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="توضیحات بیشتر..."
              className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>پیوست‌ها (اختیاری)</Form.Label>
            <p className="text-muted">
              مدارک مورد نیاز: نقشه‌های معماری، پروانه ساخت (اختیاری).
            </p>
            <div className="border border-orange-400 rounded-lg p-3 bg-orange-50">
              <FileUploadTable
                files={formData.attachments}
                onChange={handleFileChange}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <div className="flex justify-center mt-4">
        <Button
          type="submit"
          className="!bg-[#ff6f00] w-50 !text-white rounded-lg py-2 px-6 text-lg hover:!bg-[#e65100] transition-all duration-300 disabled:!bg-[#fed7aa] disabled:cursor-not-allowed"
          disabled={loadingProjects || loadingSubmit}
        >
          {loadingSubmit ? (
            <>
              <Spinner animation="border" size="sm" className="ml-2" />
              در حال ارسال...
            </>
          ) : (
            "ارسال درخواست"
          )}
        </Button>
      </div>
    </Form>
  );
}

export default SupervisionRequestForm;
