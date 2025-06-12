import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { createRegistrationRequest, fetchProjects } from "../../api";

const propertyTypes = [
  { value: "", label: "انتخاب کنید..." },
  { value: "field", label: "زمین" },
  { value: "building", label: "ساختمان" },
  { value: "other", label: "سایر" },
];

const ownershipStatuses = [
  { value: "", label: "انتخاب کنید..." },
  { value: "shared_deed", label: "سند مشاع" },
  { value: "normal_purchase", label: "خرید عادی" },
];

const utmOptions = [
  { value: "have_utm", label: "نقشه UTM دارم" },
  { value: "no_utm", label: "نقشه UTM ندارم" },
];

function RegistrationRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    project: "",
    project_name: "",
    property_type: "",
    ownership_status: "",
    area: "",
    building_area: "",
    main_parcel_number: "",
    sub_parcel_number: "",
    utm_status: "have_utm", // پیش‌فرض
    location: null,
    description: "",
    attachments: [],
  });

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState("");

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
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, project: data[0].id }));
        }
      })
      .catch(() => {
        setProjects([]);
        setLoadingProjects(false);
        setError("خطا در بارگذاری پروژه‌ها.");
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
      setFormData((prev) => ({ ...prev, project: value, project_name: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // اعتبارسنجی‌ها
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
    if (formData.project === "new" && !formData.project_name.trim()) {
      setError("لطفاً عنوان پروژه جدید را وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.property_type) {
      setError("لطفاً نوع ملک را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.ownership_status) {
      setError("لطفاً وضعیت مالکیت را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.ownership_status === "shared_deed") {
      if (
        !formData.main_parcel_number.trim() ||
        !formData.sub_parcel_number.trim()
      ) {
        setError("برای سند مشاع، پلاک اصلی و فرعی اجباری هستند.");
        setLoadingSubmit(false);
        return;
      }
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
    if (
      formData.utm_status === "have_utm" &&
      Array.isArray(formData.attachments)
    ) {
      const titles = formData.attachments.map((a) => a.title.toLowerCase());
      if (
        !titles.includes("نقشه utm") ||
        !titles.includes("گواهی تعیین مختصات")
      ) {
        setError(
          "لطفاً فایل‌های 'نقشه UTM' و 'گواهی تعیین مختصات' را آپلود کنید."
        );
        setLoadingSubmit(false);
        return;
      }
    }

    setError(null);

    const payload = {
      property_type: formData.property_type,
      ownership_status: formData.ownership_status,
      request_survey: formData.utm_status === "no_utm",
      description: formData.description,
      attachments: formData.attachments,
    };

    if (formData.area) {
      payload.area = Number(formData.area);
    }
    if (formData.building_area) {
      payload.building_area = Number(formData.building_area);
    }
    if (
      formData.main_parcel_number &&
      formData.ownership_status === "shared_deed"
    ) {
      payload.main_parcel_number = formData.main_parcel_number;
    }
    if (
      formData.sub_parcel_number &&
      formData.ownership_status === "shared_deed"
    ) {
      payload.sub_parcel_number = formData.sub_parcel_number;
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
      console.log("Payload:", payload); // برای دیباگ
      const result = await createRegistrationRequest(payload);
      setRequiredDocuments(result.required_documents || "");
      alert("درخواست اخذ سند با موفقیت ارسال شد!");
      setFormData({
        project: projects.length > 0 ? projects[0].id : "",
        project_name: "",
        property_type: "",
        ownership_status: "",
        area: "",
        building_area: "",
        main_parcel_number: "",
        sub_parcel_number: "",
        utm_status: "have_utm",
        location: null,
        description: "",
        attachments: [],
      });
      if (onSubmit) onSubmit(result);
    } catch (err) {
      let detail = "خطای ناشناخته";
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          detail = err.response.data.detail;
        } else if (
          err.response.data.non_field_errors &&
          Array.isArray(err.response.data.non_field_errors) &&
          err.response.data.non_field_errors.length > 0
        ) {
          detail = err.response.data.non_field_errors[0];
        } else {
          detail = err.message || "خطای ناشناخته";
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
          .utm-select {
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          .utm-select:focus {
            border-color: #0056b3;
            box-shadow: 0 0 5px rgba(0,123,255,0.5);
            outline: none;
          }
          .utm-select option {
            padding: 10px;
          }
        `}
      </style>
      <h5 className="mb-3 text-primary">درخواست اخذ سند</h5>

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
        <Form.Label>نوع ملک</Form.Label>
        <Form.Select
          name="property_type"
          value={formData.property_type}
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
        <Form.Label>وضعیت مالکیت</Form.Label>
        <Form.Select
          name="ownership_status"
          value={formData.ownership_status}
          onChange={handleInputChange}
          required
        >
          {ownershipStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
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

      {formData.property_type === "building" && (
        <Form.Group className="mb-3">
          <Form.Label>مساحت بنا (متر مربع)</Form.Label>
          <Form.Control
            type="number"
            name="building_area"
            value={formData.building_area}
            onChange={handleInputChange}
            placeholder="مثلاً 500"
            min={0}
          />
        </Form.Group>
      )}

      {formData.ownership_status === "shared_deed" && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>پلاک اصلی</Form.Label>
            <Form.Control
              type="text"
              name="main_parcel_number"
              value={formData.main_parcel_number}
              onChange={handleInputChange}
              placeholder="پلاک اصلی را وارد کنید"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>پلاک فرعی</Form.Label>
            <Form.Control
              type="text"
              name="sub_parcel_number"
              value={formData.sub_parcel_number}
              onChange={handleInputChange}
              placeholder="پلاک فرعی را وارد کنید"
              required
            />
          </Form.Group>
        </>
      )}

      <Form.Group className="mb-3">
        <Form.Label>وضعیت نقشه UTM</Form.Label>
        <Form.Select
          name="utm_status"
          value={formData.utm_status}
          onChange={handleInputChange}
          className="utm-select"
        >
          {utmOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
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
          {requiredDocuments ||
            "مدارک مورد نیاز: مدرک مالکیت، تصویر شناسنامه، کارت ملی برابر اصل. این مدارک اجباری هستند و باید در نهایت ارائه شوند."}
          {formData.utm_status === "have_utm" && (
            <>
              <br />
              <span>
                لطفاً فایل‌های نقشه UTM و گواهی تعیین مختصات را آپلود کنید.
              </span>
            </>
          )}
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

export default RegistrationRequestForm;
