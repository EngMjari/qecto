import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      await axios.post("http://localhost:8000/api/send-otp/", { phone });
      setStep(2);
      setMessage("کد تایید ارسال شد.");
    } catch (error) {
      console.error(error);
      setMessage("خطا در ارسال کد.");
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/verify-otp/", {
        phone,
        otp,
      });
      const { access, refresh } = response.data;

      // ذخیره توکن‌ها در localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      login(access, refresh);
      setMessage("ورود موفق!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("کد اشتباه یا خطا در سرور.");
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">ورود به پنل کاربری</h3>
        {step === 1 ? (
          <>
            <label className="form-label">شماره موبایل</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="مثال: 09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button className="btn btn-primary w-100" onClick={sendOTP}>
              ارسال کد تایید
            </button>
          </>
        ) : (
          <>
            <label className="form-label">کد تایید</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="کد تایید را وارد کنید"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="btn btn-success w-100" onClick={verifyOTP}>
              تایید و ورود
            </button>
          </>
        )}
        {message && <p className="text-center mt-3 text-danger">{message}</p>}
      </div>
    </div>
  );
}
