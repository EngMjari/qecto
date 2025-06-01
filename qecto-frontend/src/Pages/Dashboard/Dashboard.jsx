import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// داده نمونه درخواست‌ها
const dummyRequests = [
  { id: 1, title: 'درخواست نقشه برداری', status: 'در حال اجرا', date: '2025-05-20' },
  { id: 2, title: 'درخواست کارشناسی', status: 'کامل شده', date: '2025-04-15' },
  { id: 3, title: 'درخواست ثبت سند', status: 'در حال اجرا', date: '2025-05-01' },
  { id: 4, title: 'درخواست اصلاح موقعیت', status: 'کامل شده', date: '2025-03-28' },
  { id: 5, title: 'درخواست بررسی ملک', status: 'لغو شده', date: '2025-05-25' },
  { id: 6, title: 'درخواست بررسی وضعیت', status: 'لغو شده', date: '2025-06-01' },
];

// بخش تغییر اطلاعات کاربری
const UserProfile = ({ userInfo, onUpdate }) => {
  const [formData, setFormData] = useState(userInfo);

  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="card shadow-sm p-4 mt-4">
      <h4 className="mb-3">اطلاعات کاربری</h4>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-4">
          <label className="form-label">نام و نام خانوادگی</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">ایمیل</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">شماره تلفن</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">ذخیره تغییرات</button>
        </div>
      </form>
    </div>
  );
};

// لیست درخواست‌ها برای هر وضعیت به صورت تب
const RequestTab = ({ title, requests, onSelect }) => {
  if (requests.length === 0) {
    return <p className="text-center my-3 text-muted">درخواستی در این بخش وجود ندارد</p>;
  }

  return (
    <ul className="list-group">
      {requests.map(req => (
        <li
          key={req.id}
          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(req)}
        >
          <div>
            <strong>{req.title}</strong> <br />
            <small>{req.date}</small>
          </div>
          <span
            className={`badge ${
              req.status === 'کامل شده' ? 'bg-success' :
              req.status === 'در حال اجرا' ? 'bg-warning text-dark' :
              req.status === 'لغو شده' ? 'bg-danger' :
              'bg-secondary'
            }`}
          >
            {req.status}
          </span>
        </li>
      ))}
    </ul>
  );
};

const RequestDetail = ({ request, onClose }) => {
  if (!request) return null;
  return (
    <div className="card shadow-sm p-3 mt-3">
      <h5 className="card-title mb-3">جزئیات درخواست</h5>
      <p><strong>عنوان:</strong> {request.title}</p>
      <p><strong>وضعیت:</strong> {request.status}</p>
      <p><strong>تاریخ ثبت:</strong> {request.date}</p>
      <button className="btn btn-secondary mt-3" onClick={onClose}>بستن</button>
    </div>
  );
};

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'علی رضایی',
    email: 'ali@example.com',
    phone: '09123456789',
  });

  const [requests, setRequests] = useState(dummyRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('در حال اجرا');

  // آمار برای نمودار دایره ای
  const statusCounts = {
    'کامل شده': requests.filter(r => r.status === 'کامل شده').length,
    'در حال اجرا': requests.filter(r => r.status === 'در حال اجرا').length,
    'لغو شده': requests.filter(r => r.status === 'لغو شده').length,
  };

  const data = {
    labels: ['کامل شده', 'در حال اجرا', 'لغو شده'],
    datasets: [
      {
        label: 'وضعیت درخواست‌ها',
        data: [statusCounts['کامل شده'], statusCounts['در حال اجرا'], statusCounts['لغو شده']],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        hoverOffset: 10,
      },
    ],
  };

  const handleUserUpdate = (newInfo) => {
    setUserInfo(newInfo);
    alert('اطلاعات کاربری به‌روز شد');
  };

  // درخواست‌های هر تب
  const filteredRequests = requests.filter(r => r.status === activeTab);

  return (
    <div className="container py-4" style={{ maxWidth: '900px' }}>
      <h2 className="mb-4 text-center">داشبورد کاربر</h2>

      {/* نمودار دایره‌ای */}
      <div className="card shadow-sm p-4 mb-4">
        <h4 className="mb-3">وضعیت درخواست‌ها</h4>
        <Pie data={data} />
      </div>

      {/* تب‌های وضعیت درخواست‌ها */}
      <ul className="nav nav-tabs mb-3">
        {['در حال اجرا', 'کامل شده', 'لغو شده'].map(status => (
          <li className="nav-item" key={status}>
            <button
              className={`nav-link ${activeTab === status ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(status);
                setSelectedRequest(null);
              }}
            >
              {status} ({statusCounts[status]})
            </button>
          </li>
        ))}
      </ul>

      <div className="row gap-3">
        <div className="col-md-6">
          <RequestTab
            title={activeTab}
            requests={filteredRequests}
            onSelect={setSelectedRequest}
          />
        </div>

        <div className="col-md-6">
          <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
        </div>
      </div>

      {/* اطلاعات کاربری */}
      <UserProfile userInfo={userInfo} onUpdate={handleUserUpdate} />
    </div>
  );
};

export default Dashboard;
