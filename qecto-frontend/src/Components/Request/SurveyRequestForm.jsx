import React, { useEffect, useState } from "react";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { createSurveyRequest, fetchProjects } from "../../api";

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
        // اگر پروژه‌ها وجود داره، اولین پروژه رو به‌صورت پیش‌فرض انتخاب کن
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
        title: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // اعتبارسنجی‌ها
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
    if (formData.project === "new" && !formData.title.trim()) {
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

    if (formData.project && formData.project !== "new") {
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
      alert("درخواست با موفقیت ارسال شد!");
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
      className="p-3 border rounded shadow-sm bg-white"
    >
      <h5 className="mb-3 text-primary">درخواست نقشه‌برداری</h5>

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
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="نام پروژه جدید را وارد کنید"
            required
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>نوع ملک</Form.Label>
        <Form.Select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleInputChange}
          required
        >
          {propertyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>مساحت زمین (متر مربع، حدودی)</Form.Label>
        <Form.Control
          type="number"
          name="area"
          value={formData.area}
          onChange={handleInputChange}
          placeholder="مثلاً 1000"
          required
          min={1}
        />
      </Form.Group>

      {formData.propertyType === "building" && (
        <Form.Group className="mb-3">
          <Form.Label>مساحت بنا (متر مربع، اختیاری)</Form.Label>
          <Form.Control
            type="number"
            name="buildingArea"
            value={formData.buildingArea}
            onChange={handleInputChange}
            placeholder="مثلاً 500"
            min={0}
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>وضعیت سند</Form.Label>
        <Form.Select
          name="documentStatus"
          value={formData.documentStatus}
          onChange={handleInputChange}
        >
          {documentStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {formData.documentStatus === "has_document" && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>پلاک ثبتی اصلی</Form.Label>
            <Form.Control
              type="text"
              name="mainParcelNumber"
              value={formData.mainParcelNumber}
              onChange={handleInputChange}
              placeholder="پلاک ثبتی اصلی را وارد کنید"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>پلاک ثبتی فرعی</Form.Label>
            <Form.Control
              type="text"
              name="subParcelNumber"
              value={formData.subParcelNumber}
              onChange={handleInputChange}
              placeholder="پلاک ثبتی فرعی را وارد کنید"
              required
            />
          </Form.Group>
        </>
      )}

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

      {formData.location && formData.area && (
        <div className="mb-3 p-3 border rounded bg-info text-white">
          <strong>برآورد هزینه:</strong> حدوداً {totalCost.toFixed(2)} میلیون
          تومان
          <br />
          (مسافت تا دفتر: {distanceKm?.toFixed(2)} کیلومتر)
        </div>
      )}

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

export default SurveyRequestForm;
