import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { createSurveyRequest, fetchProjects } from "../../api";
import { toast } from "react-toastify";

const propertyTypes = [
  { value: "", label: "انتخاب کنید..." },
  { value: "field", label: "زمین" },
  { value: "building", label: "ساختمان" },
  { value: "other", label: "سایر" },
];

const documentStatusOptions = [
  { value: "no_document", label: "بدون سند" },
  { value: "has_document", label: "سند دار" },
];

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateBaseCost(area) {
  if (area <= 250) return 5 / 3 + (area / 250) * (2 / 3);
  if (area <= 1000) return 7 / 3 + ((area - 250) / 750) * (5 / 3);
  return 4 + ((area - 1000) / 100) * 0.083;
}

function SurveyRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    project: "",
    title: "",
    propertyType: "",
    area: "",
    buildingArea: "",
    description: "",
    location: null,
    attachments: [],
    documentStatus: "no_document",
    mainParcelNumber: "",
    subParcelNumber: "",
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
      .catch(() => {
        setProjects([]);
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
      title: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    if (!formData.location) {
      setError("لطفاً موقعیت ملک را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.propertyType) {
      setError("لطفاً نوع ملک را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.area || Number(formData.area) <= 0) {
      setError("لطفاً مساحت زمین معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.project && !formData.title.trim()) {
      setError("لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.showNewProjectForm && !formData.title.trim()) {
      setError("لطفاً عنوان پروژه جدید را وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (
      formData.documentStatus === "has_document" &&
      (!formData.mainParcelNumber.trim() || !formData.subParcelNumber.trim())
    ) {
      setError("لطفاً پلاک ثبتی اصلی و فرعی را وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.buildingArea && Number(formData.buildingArea) <= 0) {
      setError("لطفاً مساحت بنا معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }

    setError(null);

    const payload = {
      property_type: formData.propertyType,
      area: Number(formData.area),
      description: formData.description,
      location: formData.location,
      attachments: formData.attachments,
    };

    if (formData.buildingArea) {
      payload.building_area = Number(formData.buildingArea);
    }
    if (formData.project && !formData.showNewProjectForm) {
      payload.project = formData.project;
    } else {
      payload.project_name = formData.title.trim();
    }
    if (formData.documentStatus === "has_document") {
      payload.main_parcel_number = formData.mainParcelNumber.trim();
      payload.sub_parcel_number = formData.subParcelNumber.trim();
    }

    try {
      const result = await createSurveyRequest(payload);
      toast.success("درخواست نقشه‌برداری با موفقیت ارسال شد!");
      setFormData({
        project: projects.length > 0 ? projects[0].id : "",
        title: "",
        propertyType: "",
        area: "",
        buildingArea: "",
        description: "",
        location: null,
        attachments: [],
        documentStatus: "no_document",
        mainParcelNumber: "",
        subParcelNumber: "",
        showNewProjectForm: false,
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

  const officeCoords = { lat: 36.726217, lng: 51.104315 };
  const areaNum = Number(formData.area);
  const distanceKm = formData.location
    ? haversineDistance(
        officeCoords.lat,
        officeCoords.lng,
        formData.location.lat,
        formData.location.lng
      )
    : null;

  const baseCost = areaNum ? estimateBaseCost(areaNum) : 0;
  const distanceCost = distanceKm ? Math.floor(distanceKm / 10) * 0.5 : 0;
  const totalCost = baseCost + distanceCost;

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-3 border border-gray-300 rounded-lg shadow-sm bg-white"
    >
      <h5 className="mb-3 text-blue-600">درخواست نقشه‌برداری</h5>

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
                name="title"
                value={formData.title}
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
              نوع ملک <span className="text-red-500">*</span>
            </Form.Label>
            <Form.Select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              required
              className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundPosition: "left 0.75rem center",
              }}
            >
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={formData.propertyType === "building" ? 6 : 12}>
          <Form.Group>
            <Form.Label>
              مساحت زمین (متر مربع، حدودی){" "}
              <span className="text-red-500">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="مثلاً 1000"
              required
              min={1}
              className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            />
          </Form.Group>
        </Col>
        {formData.propertyType === "building" && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>مساحت بنا (متر مربع، اختیاری)</Form.Label>
              <Form.Control
                type="number"
                name="buildingArea"
                value={formData.buildingArea}
                onChange={handleInputChange}
                placeholder="مثلاً 500"
                min={0}
                className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>وضعیت سند</Form.Label>
            <Form.Select
              name="documentStatus"
              value={formData.documentStatus}
              onChange={handleInputChange}
              className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundPosition: "left 0.75rem center",
              }}
            >
              {documentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {formData.documentStatus === "has_document" && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                پلاک ثبتی اصلی <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="mainParcelNumber"
                value={formData.mainParcelNumber}
                onChange={handleInputChange}
                placeholder="پلاک ثبتی اصلی را وارد کنید"
                required
                className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                پلاک ثبتی فرعی <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="subParcelNumber"
                value={formData.subParcelNumber}
                onChange={handleInputChange}
                placeholder="پلاک ثبتی فرعی را وارد کنید"
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
              موقعیت ملک <span className="text-red-500">*</span>
            </Form.Label>
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

      {formData.location && formData.area && (
        <Row className="mb-3">
          <Col md={12}>
            <div className="p-3 border border-orange-400 rounded-lg bg-orange-50 text-orange-600">
              <strong>برآورد هزینه:</strong> حدوداً {totalCost.toFixed(2)}{" "}
              میلیون تومان
              <br />
              (مسافت تا دفتر: {distanceKm?.toFixed(2)} کیلومتر)
            </div>
          </Col>
        </Row>
      )}

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
            <div className="border border-orange-400 rounded-lg p-3 bg-orange-50">
              <FileUploadTable
                files={formData.attachments}
                onFileChange={handleFileChange}
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

export default SurveyRequestForm;
