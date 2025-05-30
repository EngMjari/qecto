import React from 'react';
import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light text-center">
      <h1 className="display-1 fw-bold text-warning">403</h1>
      <h2 className="mb-3">دسترسی غیرمجاز</h2>
      <p className="text-muted mb-4">
        شما مجاز به مشاهده این صفحه نیستید. لطفاً با دسترسی مناسب وارد شوید.
      </p>
      <Link to="/" className="btn btn-secondary px-4">
        بازگشت به خانه
      </Link>
    </div>
  );
}
