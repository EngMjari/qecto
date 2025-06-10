import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import "../../Styles/Login.css";
import axiosInstance from "../../utils/axiosInstance";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useContext(AuthContext);

  const validatePhone = (value) => {
    // شماره موبایل باید 11 رقم و با 09 شروع بشه
    return /^09\d{9}$/.test(value);
  };

  const handleChange = (e) => {
    setPhone(e.target.value); // آزاد بذار تایپ کنه
    setError(false); // وقتی تایپ میکنه خطا رو پاک کن
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError(true);
    } else {
      setError(false);
      if (step === 1) {
        sendOTP();
      } else {
        verifyOTP();
      }
    }
  };

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
    if (isAuthenticated) {
      if (userRole === "superadmin") navigate("/super-admin-panel");
      else if (userRole === "admin") navigate("/admin-panel");
      else navigate("/dashboard");
    }
  }, [step, timer, isAuthenticated, userRole, navigate]);

  const sendOTP = async () => {
    try {
      await axiosInstance.post(`/api/send-otp/`, { phone });
      setStep(2);
      setMessage("کد تأیید به " + phone + " ارسال شد");
      setTimer(120);
    } catch {
      setMessage("خطا در ارسال کد.");
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axiosInstance.post(`/api/verify-otp/`, {
        phone,
        otp,
      });
      const { access, refresh } = response.data;
      login(access, refresh);
      setMessage("ورود موفق!");
      if (userRole === "superadmin") navigate("/super-admin-panel");
      else if (userRole === "admin") navigate("/admin-panel");
      else navigate("/dashboard");
    } catch (error) {
      setMessage("کد نادرست یا منقضی شده است.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center mt-5"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div
        className="shadow p-4 text-center"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          background: "linear-gradient(to right, #e0eafc, #cfdef3)",
          color: "#333",
        }}
      >
        <img src={logo} alt="لوگو" style={{ width: 60, marginBottom: 15 }} />
        <h4 className="mb-4 fw-bold">ورود به حساب کاربری</h4>

        <form onSubmit={handleSubmit} noValidate>
          {step === 1 ? (
            <>
              <div
                className="form-group mb-3 text-end"
                style={{ position: "relative" }}
              >
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handleChange}
                  maxLength={11}
                  className={`form-control ${error ? "is-invalid" : ""}`}
                  required
                />
                <label
                  htmlFor="phone"
                  className={`floating-label ${phone ? "filled" : ""}`}
                >
                  <i
                    className="bi bi-phone"
                    style={{
                      color: "#f39c12",
                      marginRight: 0,
                      marginLeft: "8px",
                      verticalAlign: "middle",
                      transition: "all 0.3s ease",
                    }}
                  ></i>
                  شماره موبایل
                </label>
                {error && (
                  <div
                    className="invalid-feedback"
                    style={{ textAlign: "right" }}
                  >
                    شماره موبایل صحیح نیست
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-outline-danger w-100 mt-2"
                disabled={!phone.trim()}
              >
                ارسال کد تأیید
              </button>
            </>
          ) : (
            <>
              <div
                className="form-group mb-3 text-end"
                style={{ position: "relative" }}
              >
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="otp"
                  className="form-control"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ direction: "rtl" }}
                  required
                />
                <label
                  htmlFor="otp"
                  className={`floating-label ${otp ? "filled" : ""}`}
                >
                  <i
                    className="bi bi-shield-lock"
                    style={{
                      color: "#f39c12",
                      marginRight: 0,
                      marginLeft: "8px",
                      verticalAlign: "middle",
                      transition: "all 0.3s ease",
                    }}
                  ></i>
                  کد تأیید
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-outline-success col-11 mx-auto mb-2"
                disabled={!otp.trim()}
              >
                تأیید و ورود
              </button>
              <button
                className="btn btn-outline-secondary col-11 mx-auto mb-2"
                onClick={sendOTP}
                disabled={timer > 0}
                type="button"
              >
                {timer > 0 ? `ارسال مجدد تا ${timer} ثانیه` : "ارسال مجدد کد"}
              </button>
              {message && (
                <p className="mt-3 text-primary fw-bold text-center">
                  {message}
                </p>
              )}
              <button
                className="btn btn-outline-info col-11 mx-auto mb-2"
                type="button"
                onClick={() => setStep(1)}
              >
                تغییر شماره موبایل
              </button>
            </>
          )}
        </form>

        <style>{`
          .form-group {
            margin-bottom: 1.5rem;
          }
          input.form-control {
            border-radius: 10px;
            padding: 1rem 3rem 1rem 1rem;
            font-size: 1.1rem;
          }
          label.floating-label {
            position: absolute;
            top: 50%;
            right: 3rem;
            transform: translateY(-50%);
            color: #999;
            font-weight: 500;
            cursor: text;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
            user-select: none;
            pointer-events: none;
            font-size: 1rem;
          }
          input.form-control:focus + label.floating-label,
          label.floating-label.filled {
            top: 0.3rem;
            right: 2.5rem;
            font-size: 0.75rem;
            color: #f39c12;
            pointer-events: auto;
          }
          input.form-control:focus + label.floating-label i,
          label.floating-label.filled i {
            color: #f39c12;
            transform: translateY(-3px);
          }
          .is-invalid {
            border-color: #dc3545;
            padding-right: calc(1.5em + 0.75rem);
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23dc3545' viewBox='0 0 12 12'%3e%3cpath d='M4.646 4.646a.5.5 0 0 1 .708 0L6 5.293l.646-.647a.5.5 0 0 1 .708.708L6.707 6l.647.646a.5.5 0 0 1-.708.708L6 6.707l-.646.647a.5.5 0 0 1-.708-.708L5.293 6 4.646 5.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
          }
        `}</style>
      </div>
    </div>
  );
}
