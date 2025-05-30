import React, { useState } from "react";
import axios from "axios";
export default function OTPForm({ phone }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const BASE_URL = "http://localhost:8000";

  const verifyOTP = async () => {
    try {
      const res = await axios.post(`http://${BASE_URL}/api/verify-otp/`, { phone, code });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      setMessage("ورود موفقیت‌آمیز بود ✅");
    } catch (err) {
      setMessage("کد نامعتبر یا منقضی شده ❌");
    }
  };

  return (
    <div>
      <input type="text" placeholder="کد تأیید" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={verifyOTP}>تأیید</button>
      <p>{message}</p>
    </div>
  );
}
