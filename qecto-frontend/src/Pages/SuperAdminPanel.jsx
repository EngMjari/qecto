import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdminPanel = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ phone: "", full_name: "", national_id: "" });

  const fetchAdmins = async () => {
    const res = await axios.get("http://localhost:8000/api/admin-users/");
    setAdmins(res.data);
  };

  const handleCreate = async () => {
    await axios.post("http://localhost:8000/api/admin-users/", newAdmin);
    setNewAdmin({ phone: "", full_name: "", national_id: "" });
    fetchAdmins();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/api/admin-users/${id}/`);
    fetchAdmins();
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="container mt-4" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <h3 className="mb-4">پنل مدیریت ادمین‌ها</h3>

      <div className="mb-3">
        <input
          type="text"
          placeholder="نام کامل"
          className="form-control mb-2"
          value={newAdmin.full_name}
          onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="شماره موبایل"
          className="form-control mb-2"
          value={newAdmin.phone}
          onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="کد ملی"
          className="form-control mb-2"
          value={newAdmin.national_id}
          onChange={(e) => setNewAdmin({ ...newAdmin, national_id: e.target.value })}
        />
        <button className="btn btn-success" onClick={handleCreate}>
          افزودن ادمین
        </button>
      </div>

      <table className="table table-bordered text-center">
        <thead>
          <tr>
            <th>نام</th>
            <th>موبایل</th>
            <th>کد ملی</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.full_name}</td>
              <td>{admin.phone}</td>
              <td>{admin.national_id}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(admin.id)}>
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminPanel;
