import React, { useState } from "react";
import { Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import { BASE_URL } from "../../utils/config";

function TitleRegistrationRequestForm({ onCoordinateChange, userId }) {
  const [formData, setFormData] = useState({
    deedStatus: "",
    propertyType: "",
    landUse: "",
    area: "",
    address: "",
    description: "",
    needsSurvey: false,
  });

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      title: file.name,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setFileError("");
  };

  const handleFileTitleChange = (index, title) => {
    const updated = [...files];
    updated[index].title = title;
    setFiles(updated);
  };

  const handleFileDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isFileRequired = (key) => {
    if (formData.needsSurvey) {
      return key === "idCard" || key === "nationalCard" || key === "ownership";
    } else {
      return (
        key === "map" ||
        key === "coordinateCertificate" ||
        key === "idCard" ||
        key === "nationalCard" ||
        key === "ownership"
      );
    }
  };

  return (
    <div>
      <h5 className="text-primary mb-3">درخواست ثبت نام سند</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>وضعیت سند</Form.Label>
          <Form.Select
            name="deedStatus"
            value={formData.deedStatus}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            <option value="مشاعی">مشاعی</option>
            <option value="بدون سند">بدون سند</option>
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Label>نوع ملک</Form.Label>
          <Form.Select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            <option value="زمین">زمین</option>
            <option value="باغ">باغ</option>
            <option value="ساختمان">ساختمان</option>
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Label>کاربری ملک</Form.Label>
          <Form.Control
            name="landUse"
            value={formData.landUse}
            onChange={handleChange}
            placeholder="مثلاً مسکونی، تجاری، کشاورزی"
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>مساحت (متر مربع)</Form.Label>
          <Form.Control
            name="area"
            type="number"
            value={formData.area}
            onChange={handleChange}
            required
          />
        </Col>

        <Col md={6}>
          <Form.Check
            type="checkbox"
            label="آیا نیاز به نقشه‌برداری دارد؟"
            name="needsSurvey"
            checked={formData.needsSurvey}
            onChange={handleChange}
          />
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>آدرس (در صورت نداشتن مختصات)</Form.Label>
        <Form.Control
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="آدرس دقیق محل ملک"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>توضیحات</Form.Label>
        <Form.Control
          name="description"
          value={formData.description}
          onChange={handleChange}
          as="textarea"
          rows={3}
        />
      </Form.Group>

      <Form.Group controlId="fileUpload" className="mb-3">
        <Form.Label>بارگذاری فایل‌ها</Form.Label>
        <Form.Control
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".jpg,.png,.pdf"
        />
        {fileError && <Alert variant="danger" className="mt-2">{fileError}</Alert>}
      </Form.Group>

      {files.length > 0 && (
        <Table bordered responsive size="sm">
          <thead>
            <tr>
              <th>عنوان فایل</th>
              <th>نام فایل</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {files.map((fileItem, index) => (
              <tr key={index}>
                <td>
                  <Form.Control
                    value={fileItem.title}
                    onChange={(e) =>
                      handleFileTitleChange(index, e.target.value)
                    }
                  />
                </td>
                <td>{fileItem.file.name}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleFileDelete(index)}
                  >
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Button variant="primary" type="submit">
        ارسال درخواست
      </Button>
    </div>
  );
}

export default TitleRegistrationRequestForm;
