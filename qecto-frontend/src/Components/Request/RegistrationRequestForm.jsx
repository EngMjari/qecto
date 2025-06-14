// qecto/src/components/RegistrationRequestForm.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import FileUploadTable from "../FileUpload/FileUploadTable";
import { createRegistrationRequest, fetchProjects } from "../../api";
import { toast } from "react-toastify";

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
    utm_status: "have_utm",
    location: null,
    description: "",
    attachments: [],
    showNewProjectForm: false,
  });

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState("");

  useEffect(() => {
    if (location) {
      setFormData((prev) => ({ ...prev, location }));
    }
  }, [location]);

  useEffect(() => {
    if (!user) return;
    setLoadingProjects(true);
    fetchProjects()
      .then((data) => {
        console.log("Fetched projects:", data);
        setProjects(data);
        setLoadingProjects(false);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, project: data[0].id }));
        }
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setProjects([]);
        setLoadingProjects(false);
        toast.error("خطا در بارگذاری پروژه‌ها.");
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

    console.log("FormData before validation:", formData);

    // اعتبارسنجی‌ها
    if (!user) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.project && !formData.project_name.trim()) {
      toast.error("لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.showNewProjectForm && !formData.project_name.trim()) {
      toast.error("لطفاً عنوان پروژه جدید را وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.property_type) {
      toast.error("لطفاً نوع ملک را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (!formData.ownership_status) {
      toast.error("لطفاً وضعیت مالکیت را انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.ownership_status === "shared_deed") {
      if (
        !formData.main_parcel_number.trim() ||
        !formData.sub_parcel_number.trim()
      ) {
        toast.error("برای سند مشاع، پلاک اصلی و فرعی اجباری هستند.");
        setLoadingSubmit(false);
        return;
      }
    }
    if (formData.area && Number(formData.area) <= 0) {
      toast.error("لطفاً مساحت زمین معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (formData.building_area && Number(formData.building_area) <= 0) {
      toast.error("لطفاً مساحت بنا معتبر وارد کنید.");
      setLoadingSubmit(false);
      return;
    }
    if (
      !formData.location ||
      !formData.location.lat ||
      !formData.location.lng
    ) {
      toast.error("لطفاً موقعیت ملک را روی نقشه انتخاب کنید.");
      setLoadingSubmit(false);
      return;
    }

    // آماده‌سازی formValues
    const formValues = {
      project: formData.project,
      project_name: formData.project_name.trim(),
      property_type: formData.property_type,
      ownership_status: formData.ownership_status,
      area: formData.area ? Number(formData.area) : undefined,
      building_area: formData.building_area
        ? Number(formData.building_area)
        : undefined,
      main_parcel_number: formData.main_parcel_number
        ? Number(formData.main_parcel_number)
        : undefined,
      sub_parcel_number: formData.sub_parcel_number
        ? Number(formData.sub_parcel_number)
        : undefined,
      request_survey: formData.utm_status === "no_utm",
      location: formData.location,
      description: formData.description || "",
      attachments: formData.attachments,
    };

    console.log("FormValues before API call:", formValues);

    try {
      const result = await createRegistrationRequest(formValues);
      console.log("API response:", result);
      setRequiredDocuments(result.required_documents || "");
      toast.success("درخواست اخذ سند با موفقیت ارسال شد!");
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
          detail = err.response.data.non_field_errors.join(", ");
        } else if (err.response.data.property_type) {
          detail = err.response.data.property_type.join(", ");
        } else if (
          err.response.data.location_lat ||
          err.response.data.location_lng
        ) {
          detail = "موقعیت ملک (مختصات) نامعتبر است.";
        } else {
          detail =
            JSON.stringify(err.response.data) || err.message || "خطای ناشناخته";
        }
      } else {
        detail = err.message || "خطای ناشناخته";
      }
      toast.error(`خطا در ارسال درخواست: ${detail}`);
      console.error("API Error:", err.response?.data || err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-3 border border-gray-300 rounded-lg shadow-sm bg-white"
    >
      <h5 className="mb-3 text-blue-600">درخواست اخذ سند</h5>

      <Row className="mb-3 space-y-2">
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
                className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundPosition: "left 0.75rem center",
                }}
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
        <Col md={4} className="flex items-end">
          <Button
            className="w-100 !border-2  !border-[#ff6f00] !text-[#ff6f00] rounded-lg py-2 px-4 text-base hover:!bg-[#f97316] hover:!text-white transition-all duration-300 !bg-transparent"
            onClick={toggleNewProjectForm}
          >
            {formData.showNewProjectForm
              ? "لغو ایجاد پروژه"
              : "ایجاد پروژه جدید"}
          </Button>
        </Col>
      </Row>

      {formData.showNewProjectForm && (
        <Form.Group className="mb-3">
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
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              نوع ملک <span className="text-red-500">*</span>
            </Form.Label>
            <Form.Select
              name="property_type"
              value={formData.property_type}
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
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              وضعیت مالکیت <span className="text-red-500">*</span>
            </Form.Label>
            <Form.Select
              name="ownership_status"
              value={formData.ownership_status}
              onChange={handleInputChange}
              required
              className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundPosition: "left 0.75rem center",
              }}
            >
              {ownershipStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {(formData.property_type === "field" ||
        formData.property_type === "building") && (
        <Row className="mb-3">
          <Col md={formData.property_type === "field" ? 12 : 6}>
            <Form.Group>
              <Form.Label>مساحت زمین (متر مربع)</Form.Label>
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
          {formData.property_type === "building" && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>مساحت بنا (متر مربع)</Form.Label>
                <Form.Control
                  type="number"
                  name="building_area"
                  value={formData.building_area}
                  onChange={handleInputChange}
                  placeholder="مثلاً 500"
                  min={0}
                  className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
              </Form.Group>
            </Col>
          )}
        </Row>
      )}

      {formData.ownership_status === "shared_deed" && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                پلاک اصلی <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="main_parcel_number"
                value={formData.main_parcel_number}
                onChange={handleInputChange}
                placeholder="پلاک اصلی را وارد کنید"
                required
                className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                پلاک فرعی <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="sub_parcel_number"
                value={formData.sub_parcel_number}
                onChange={handleInputChange}
                placeholder="پلاک فرعی را وارد کنید"
                required
                className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>وضعیت نقشه UTM</Form.Label>
            <Form.Select
              name="utm_status"
              value={formData.utm_status}
              onChange={handleInputChange}
              className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundPosition: "left 0.75rem center",
              }}
            >
              {utmOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
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
                هنوز موقعیتی انتخاب نشده است. لطفاً موقعیت را روی نقشه انتخاب
                کنید.
              </div>
            )}
          </Form.Group>
        </Col>
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
          className="border-2 border-gray-300 rounded-lg p-2 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>پیوست‌ها</Form.Label>
        <ul className="list-disc pr-5 mb-3 text-gray-700 ">
          <li>مدرک مالکیت</li>
          <li>تصویر شناسنامه برابر اصل</li>
          <li>کارت ملی برابر اصل</li>
          {formData.utm_status === "have_utm" && (
            <>
              <li>فایل‌های نقشه UTM (در صورت وجود)</li>
              <li>گواهی تعیین مختصات (در صورت وجود)</li>
            </>
          )}
        </ul>
        <div className="border border-orange-400 rounded-lg p-3 bg-orange-50">
          <FileUploadTable
            files={formData.attachments}
            onChange={handleFileChange}
          />
        </div>
      </Form.Group>

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

export default RegistrationRequestForm;
