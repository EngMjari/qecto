import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import axiosInstance from "../../utils/axiosInstance";

export default function Login({ showToast }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const { login, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const validatePhone = (value) => /^09\d{9}$/.test(value);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError(true);
      showToast("شماره موبایل معتبر نیست", "error");
      return;
    }
    setError(false);
    step === 1 ? sendOTP() : verifyOTP();
  };

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [step, timer]);

  const sendOTP = async () => {
    try {
      await axiosInstance.post(`/api/send-otp/`, { phone });
      setStep(2);
      setMessage(`کد تأیید به ${phone} ارسال شد`);
      showToast(`کد تأیید به ${phone} ارسال شد`);
      setTimer(120);
    } catch {
      showToast("خطا در ارسال کد", "error");
      setMessage("خطا در ارسال کد");
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
      showToast("ورود موفق!");
      setMessage("ورود موفق!");
      if (userRole === "superadmin") navigate("/super-admin-panel");
      else if (userRole === "admin") navigate("/admin-panel");
      else navigate("/");
    } catch {
      showToast("کد نادرست یا منقضی شده است");
      setMessage("کد نادرست یا منقضی شده است");
    }
  };

  return (
    <div className="page-content container mx-auto flex justify-center items-center min-h-[calc(100vh-160px)] py-4 text-right font-sans">
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 shadow-lg p-6 rounded-xl w-full max-w-sm text-gray-800">
        <img
          src={logo}
          alt="لوگو"
          className="w-14 mx-auto mb-4 animate-bounce"
        />
        <h4 className="mb-4 text-xl font-bold text-gray-900 text-center">
          ورود به حساب کاربری
        </h4>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {step === 1 ? (
            <>
              <div className="relative z-0 w-full group">
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={11}
                  className={`peer block w-full appearance-none border-b-2 bg-transparent px-0 pt-4 pb-1 text-right text-sm text-gray-900 focus:border-orange-500 focus:outline-none ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="phone"
                  className="absolute right-0 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-orange-500"
                >
                  شماره موبایل
                </label>
                {error && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    شماره موبایل معتبر نیست
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!phone.trim()}
              >
                ارسال کد تأیید
              </button>
            </>
          ) : (
            <>
              <div className="relative z-0 w-full group">
                <input
                  type="tel"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="peer block w-full appearance-none border-b-2 bg-transparent px-0 pt-4 pb-1 text-right text-sm text-gray-900 focus:border-green-500 focus:outline-none border-gray-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="otp"
                  className="absolute right-0 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-500"
                >
                  کد تأیید
                </label>
              </div>
              {message && (
                <p className="text-blue-700 mt-3 text-center font-bold">
                  {message}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-green-400 text-white hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!otp.trim()}
              >
                تأیید و ورود
              </button>
              <button
                type="button"
                onClick={sendOTP}
                className="w-full py-2 rounded-lg bg-gray-400 text-black hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={timer > 0}
              >
                {timer > 0 ? `ارسال مجدد تا ${timer} ثانیه` : "ارسال مجدد کد"}
              </button>
              {timer > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timer / 120) * 100}%` }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 rounded-lg bg-orange-400 text-gray-800 hover:bg-orange-600 transition"
              >
                تغییر شماره موبایل
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
