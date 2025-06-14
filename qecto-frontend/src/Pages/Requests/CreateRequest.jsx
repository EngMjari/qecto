import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import LocationMarker from "../../Components/Request/LocationMarker";
import SurveyRequestForm from "../../Components/Request/SurveyRequestForm";
import ExpertRequestForm from "../../Components/Request/ExpertRequestForm";
import ExecutionRequestForm from "../../Components/Request/ExecutionRequestForm";
import RegistrationRequestForm from "../../Components/Request/RegistrationRequestForm";
import SupervisionRequestForm from "../../Components/Request/SupervisionRequestForm";
import { useAuth } from "../../hooks/useAuth";

const CreateRequest = () => {
  const { isAuthenticated, user } = useAuth();
  const [requestType, setRequestType] = useState("survey");
  const [location, setLocation] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="page-content flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-orange-50 text-center">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h4 className="mb-4 text-red-600 font-bold text-xl">
            برای ارسال درخواست، ابتدا باید وارد شوید
          </h4>
          <a
            href="/login"
            className="inline-block bg-[#ff6f00] text-white rounded-lg py-2 px-6 text-base hover:bg-[#e65100] transition-all duration-300 transform hover:scale-105"
            aria-label="ورود به حساب کاربری"
          >
            ورود به حساب کاربری
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content container-fluid py-6 bg-gradient-to-b from-gray-50 to-orange-50 min-h-screen">
      <div className="container">
        <h2 className="text-blue-600 font-bold text-2xl mb-2">
          ایجاد درخواست جدید
        </h2>
        <p className="text-gray-600 mb-6">
          نوع درخواست خود را انتخاب کنید و اطلاعات مورد نیاز را وارد کنید.
        </p>
        <Row>
          {/* فرم‌ها */}
          <Col lg={6} md={12} className="mb-4">
            <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300 transition-all duration-300">
              <Form.Group className="mb-4">
                <Form.Label className="font-bold text-gray-700">
                  نوع درخواست <span className="text-red-500">*</span>
                </Form.Label>
                <Form.Select
                  id="requestType"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="border-2 border-orange-400 rounded-lg p-2 text-base focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-no-repeat bg-[length:1.25rem] pl-10 transition-all duration-300"
                  aria-label="انتخاب نوع درخواست"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundPosition: "left 0.75rem center",
                  }}
                >
                  <option value="survey">درخواست نقشه‌برداری</option>
                  <option value="expert">درخواست کارشناسی</option>
                  <option value="registration">درخواست ثبت نام سند</option>
                  <option value="execute">درخواست مجری</option>
                  <option value="supervision">درخواست ناظر</option>
                </Form.Select>
              </Form.Group>

              <div className="animate-fade-in">
                {requestType === "survey" && (
                  <SurveyRequestForm location={location} user={user} />
                )}
                {requestType === "expert" && (
                  <ExpertRequestForm location={location} user={user} />
                )}
                {requestType === "registration" && (
                  <RegistrationRequestForm location={location} user={user} />
                )}
                {requestType === "execute" && (
                  <ExecutionRequestForm location={location} user={user} />
                )}
                {requestType === "supervision" && (
                  <SupervisionRequestForm location={location} user={user} />
                )}
              </div>
            </div>
          </Col>
          {/* نقشه */}
          <Col lg={6} md={12} className="mb-4">
            <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300">
              <h5 className="text-blue-600 font-bold mb-3">انتخاب موقعیت</h5>
              <LocationMarker onLocationChange={setLocation} />
            </div>
          </Col>
        </Row>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateRequest;
