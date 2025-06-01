import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light text-center">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-3">صفحه مورد نظر یافت نشد</h2>
      <p className="text-muted mb-4">
        ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه دیگر وجود نداشته باشد.
      </p>
      <Link to="/" className="btn btn-primary px-4">
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
