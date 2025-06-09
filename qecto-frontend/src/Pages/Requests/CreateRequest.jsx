import React, { useState } from "react";
import LocationMarker from "../../Components/Request/LocationMarker";
import SurveyRequestForm from "../../Components/Request/SurveyRequestForm";
import ExpertRequestForm from "../../Components/Request/ExpertRequestForm";
import DeedRegistrationForm from "../../Components/Request/DeedRegistrationForm";
import { useAuth } from "../../hooks/useAuth";

const CreateRequest = () => {
  const { isAuthenticated, user } = useAuth();
  const [requestType, setRequestType] = useState("survey");
  const [location, setLocation] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light text-center">
        <div>
          <h4 className="mb-3 text-danger">
            برای ارسال درخواست، ابتدا باید وارد شوید
          </h4>
          <a
            href="/login"
            className="btn btn-primary"
            style={{ backgroundColor: "#002a3a", borderColor: "#002a3a" }}
          >
            ورود به حساب کاربری
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* فرم‌ها سمت راست */}
        <div className="col-lg-6">
          <div className="mb-3">
            <label htmlFor="requestType" className="form-label fw-bold">
              نوع درخواست
            </label>
            <select
              id="requestType"
              className="form-select"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
            >
              <option value="survey">درخواست نقشه‌برداری</option>
              <option value="expert">درخواست کارشناسی</option>
              <option value="deed">درخواست ثبت نام سند</option>
            </select>
          </div>

          {requestType === "survey" && (
            <SurveyRequestForm location={location} user={user} />
          )}
          {requestType === "expert" && (
            <ExpertRequestForm location={location} user={user} />
          )}
          {requestType === "deed" && (
            <DeedRegistrationForm location={location} user={user} />
          )}
        </div>
        {/* نقشه سمت چپ */}
        <div className="col-lg-6 mb-4">
          <LocationMarker onLocationChange={setLocation} />
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
