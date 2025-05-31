import React, { useEffect, useState } from "react";
import FileUploadTable from "./FileUploadTable";
import { Form, Button, Alert } from "react-bootstrap";

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateBaseCost(area) {
  if (area <= 250) {
    return 5 / 3 + (area / 250) * (2 / 3);
  } else if (area <= 1000) {
    return 7 / 3 + ((area - 250) / 750) * (5 / 3);
  } else {
    return 4 + ((area - 1000) / 100) * 0.083;
  }
}

function SurveyRequestForm({ onSubmit, user, location }) {
  const [formData, setFormData] = useState({
    propertyType: "",
    area: "",
    description: "",
    location: null,
    attachments: [],
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
      const newAttachments = typeof update === "function" ? update(prev.attachments) : update;
      return {
        ...prev,
        attachments: newAttachments,
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location) {
      setError("لطفاً موقعیت ملک را از روی نقشه انتخاب کنید.");
      return;
    }
    if (!formData.propertyType) {
      setError("لطفاً نوع ملک را انتخاب کنید.");
      return;
    }
    if (!formData.area || Number(formData.area) <= 0) {
      setError("لطفاً مساحت معتبر وارد کنید.");
      return;
    }
    setError(null);

    try {
      const token = localStorage.getItem("access");

      const formPayload = new FormData();
      formPayload.append("propertyType", formData.propertyType);
      formPayload.append("area", formData.area);
      formPayload.append("description", formData.description || "");
      formPayload.append("location", JSON.stringify(formData.location));
      formPayload.append("title", formData.title);
      if (user && user.id) {
        formPayload.append("user", user.id);
      }

      formData.attachments.forEach((file) => {
        formPayload.append("attachments", file);
      });

      // ✅ لاگ کردن تمام داده‌ها
      console.log("🔍 داده‌های ارسالی:");
      for (let pair of formPayload.entries()) {
        if (pair[0] === "attachments") {
          console.log(pair[0] + ":", pair[1].name);
        } else {
          console.log(pair[0] + ":", pair[1]);
        }
      }

      const response = await fetch("http://localhost:8000/api/survey/request/", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formPayload,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("❌ خطای سرور:", errorData);
        } catch (jsonError) {
          console.error("⚠️ خطا در خواندن پاسخ خطا:", jsonError);
          errorData = { detail: response.statusText };
        }
        setError(`خطا در ارسال درخواست: ${errorData.detail || response.statusText}`);
        return;
      }

      const result = await response.json();
      alert("درخواست با موفقیت ارسال شد!");

      setFormData({
        propertyType: "",
        area: "",
        description: "",
        location: null,
        attachments: [],
      });

      if (onSubmit) onSubmit(result);
    } catch (error) {
      console.error("⚠️ خطا در ارسال:", error);
      setError("خطا در ارسال درخواست: " + error.message);
    }
  };

  const officeCoords = { lat: 36.726217, lng: 51.104315 };

  const areaNum = Number(formData.area);
  const distanceKm = formData.location ? haversineDistance(officeCoords.lat, officeCoords.lng, formData.location.lat, formData.location.lng) : null;

  const baseCost = areaNum ? estimateBaseCost(areaNum) : 0;
  const distanceCost = distanceKm ? Math.floor(distanceKm / 10) * 0.5 : 0;
  const totalCost = baseCost + distanceCost;

  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm bg-white">
      <h5 className="mb-3 text-primary">درخواست نقشه‌برداری</h5>
      <Form.Group className="mb-3">
        <Form.Label>عنوان پروژه</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="زمین در عباس آباد کوچه ..."
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>نوع ملک</Form.Label>
        <Form.Select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required>
          <option value="">انتخاب کنید</option>
          <option value="مسکونی">مسکونی</option>
          <option value="تجاری">تجاری</option>
          <option value="کشاورزی">کشاورزی</option>
          <option value="صنعتی">صنعتی</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>مساحت (متر مربع)</Form.Label>
        <Form.Control type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="مثلاً 1000" required min={1} />
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
        <Form.Label>موقعیت ملک (عرض و طول جغرافیایی)</Form.Label>
        {formData.location ? (
          <div className="p-2 border rounded bg-light text-success">
            نقطه به مختصات Φ: {formData.location.lat.toFixed(6)}، λ: {formData.location.lng.toFixed(6)} انتخاب شده است.
          </div>
        ) : (
          <div className="p-2 border rounded bg-light text-danger">هنوز موقعیتی انتخاب نشده است.</div>
        )}
      </Form.Group>

      {formData.location && formData.area && (
        <div className="mb-3 p-3 border rounded bg-info text-white">
          <strong>برآورد هزینه:</strong> حدوداً {totalCost.toFixed(2)} میلیون تومان
          <br />
          <strong>فاصله از دفتر:</strong> {distanceKm.toFixed(2)} کیلومتر
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Label>پیوست‌ها</Form.Label>
        <FileUploadTable attachments={formData.attachments} onFileChange={handleFileChange} />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button type="submit" className="btn btn-primary w-100">
        ثبت درخواست
      </Button>
    </Form>
  );
}

export default SurveyRequestForm;
