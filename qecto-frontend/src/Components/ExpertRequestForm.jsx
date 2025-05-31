import React, { useState } from "react";
import LocationMarker from "./LocationMarker";
import FileUploadTable from "./FileUploadTable";
import { Form, Button, Row, Col } from "react-bootstrap";

function ExpertEvaluationRequestForm({ onSubmit, user }) {
  const [formData, setFormData] = useState({
    propertyType: "زمین",
    area: "",
    location: null,
    description: "",
    files: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (updatedFiles) => {
    setFormData((prev) => ({ ...prev, files: updatedFiles }));
  };

  const handleLocationChange = (loc) => {
    setFormData((prev) => ({ ...prev, location: loc }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.location) {
      alert("لطفاً موقعیت ملک را مشخص کنید.");
      return;
    }
    const request = {
      ...formData,
      request_type: "کارشناسی ملک",
      user: user?.id,
    };
    onSubmit(request);
  };

  return (
    <Form onSubmit={handleSubmit} className="px-3">
      <h5 className="mb-3">درخواست کارشناسی ملک</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>نوع ملک</Form.Label>
          <Form.Select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
          >
            <option value="زمین">زمین</option>
            <option value="ساختمان">ساختمان</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>مساحت تقریبی (متر مربع)</Form.Label>
          <Form.Control
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
          />
        </Col>
      </Row>

      <LocationMarker onLocationChange={handleLocationChange} />

      <Form.Group className="mb-3">
        <Form.Label>توضیحات</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>

      <FileUploadTable files={formData.files} onFilesChange={handleFileChange} />

      <div className="text-end mt-3">
        <Button variant="primary" type="submit">
          ارسال درخواست
        </Button>
      </div>
    </Form>
  );
}

export default ExpertEvaluationRequestForm;
