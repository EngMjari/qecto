// src/components/SuperAdminPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function SuperAdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    phone: "",
    national_id: "",
    full_name: "",
    password: ""
  });

  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin-users/", { headers });
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const handleAddAdmin = async () => {
    try {
      await axios.post("http://localhost:8000/api/admin-users/", newAdmin, { headers });
      setNewAdmin({ phone: "", national_id: "", full_name: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error("Error adding admin:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">مدیریت ادمین‌ها</h2>

      <div className="mb-4">
        <input className="form-control mb-2" placeholder="شماره موبایل" value={newAdmin.phone} onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })} />
        <input className="form-control mb-2" placeholder="کد ملی" value={newAdmin.national_id} onChange={e => setNewAdmin({ ...newAdmin, national_id: e.target.value })} />
        <input className="form-control mb-2" placeholder="نام کامل" value={newAdmin.full_name} onChange={e => setNewAdmin({ ...newAdmin, full_name: e.target.value })} />
        <input className="form-control mb-2" placeholder="رمز عبور" type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
        <button className="btn btn-success" onClick={handleAddAdmin}>افزودن ادمین</button>
      </div>

      <ul className="list-group">
        {admins.map(admin => (
          <li key={admin.id} className="list-group-item d-flex justify-content-between align-items-center">
            {admin.full_name} ({admin.phone})
          </li>
        ))}
      </ul>
    </div>
  );
}
