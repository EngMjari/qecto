import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import axiosInstance from "../../utils/axiosInstance";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { SiteConfigContext } from "Contexts/SiteConfigContext";

export default function LoginModal({ isOpen, onClose }) {
  const { siteConfig } = useContext(SiteConfigContext);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const { login, isAuthenticated, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const validatePhone = (value) => /^09\d{9}$/.test(value);

  const handleChange = (e) => {
    setPhone(e.target.value);
    setError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError(true);
    } else {
      setError(false);
      step === 1 ? sendOTP() : verifyOTP();
    }
  };

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
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
      setMessage(`کد تأیید به ${phone} ارسال شد`);
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
    } catch {
      setMessage("کد نادرست یا منقضی شده است.");
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-2xl transition-all relative">
                {/* لوگو و دکمه بستن */}
                <div className="flex items-center justify-between mb-6">
                  <img src={siteConfig?.logo_url} alt="لوگو" className="w-14" />
                  <h4 className="text-lg font-bold text-center text-gray-800 align-middle transition">
                    ورود به حساب کاربری
                  </h4>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 ? (
                    <>
                      <div className="relative z-0 w-full group">
                        <input
                          type="tel"
                          value={phone}
                          onChange={handleChange}
                          maxLength={11}
                          id="phone"
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
                            شماره موبایل صحیح نیست
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
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
                          className="absolute right-0 top-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-600"
                        >
                          کد تأیید
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-green-400 text-white hover:bg-green-600 transition"
                        disabled={!otp.trim()}
                      >
                        تأیید و ورود
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-2 rounded-lg bg-orange-400 hover:bg-orange-600 text-gray-800"
                      >
                        تغییر شماره موبایل
                      </button>
                      <button
                        type="button"
                        onClick={sendOTP}
                        disabled={timer > 0}
                        className="w-full py-2 rounded-lg bg-gray-400 hover:bg-gray-600 text-black transition"
                      >
                        {timer > 0
                          ? `ارسال مجدد تا ${timer} ثانیه`
                          : "ارسال مجدد کد"}
                      </button>

                      {message && (
                        <p className="text-blue-700 mt-3 text-center font-bold">
                          {message}
                        </p>
                      )}
                    </>
                  )}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
