import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../Context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../Styles/Login.css";
const BASE_URL = "http://192.168.1.101:8000";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [step, timer]);

  const sendOTP = async () => {
    try {
      await axios.post(`${BASE_URL}/api/send-otp/`, { phone });
      setStep(2);
      setMessage("کد تأیید به " + phone + " ارسال شد");
      setTimer(120);
    } catch {
      setMessage("خطا در ارسال کد.");
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/verify-otp/`, {
        phone,
        otp,
      });
      const { access, refresh } = response.data;
      login(access, refresh);
      setMessage("ورود موفق!");
      navigate("/dashboard");
    } catch (error) {
      setMessage("کد نادرست یا منقضی شده است.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 1) {
              sendOTP();
            } else {
              verifyOTP();
            }
          }}
        >
          {step === 1 ? (
            <>
              <div className="form-group mb-3 text-end" style={{ position: "relative" }}>
                <input
                  type="tel"
                  id="phone"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <label htmlFor="phone" className={`floating-label ${phone ? "filled" : ""}`}>
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
              </div>
              <button type="submit" className="btn btn-outline-danger w-100 mt-2" disabled={!phone.trim()}>
                ارسال کد تأیید
              </button>
            </>
          ) : (
            <>
              <div className="form-group mb-3 text-end" style={{ position: "relative" }}>
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
                <label htmlFor="otp" className={`floating-label ${otp ? "filled" : ""}`}>
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
              <button type="submit" className="btn btn-outline-success col-11 mx-auto mb-2" disabled={!otp.trim()}>
                تأیید و ورود
              </button>
              <button className="btn btn-outline-secondary col-11 mx-auto mb-2" onClick={sendOTP} disabled={timer > 0} type="button">
                {timer > 0 ? `ارسال مجدد تا ${timer} ثانیه` : "ارسال مجدد کد"}
              </button>
              {message && (
                <p className="mt-3 text-primary fw-bold text-center">{message}</p>
              )}
              <button className="btn btn-outline-info col-11 mx-auto mb-2" type="button" onClick={() => setStep(1)}>
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
        `}</style>
      </div>
    </div>
  );
}
