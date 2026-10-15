import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-4 text-center">
      <div style={{ maxWidth: 440 }}>
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center text-primary"
          style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)' }}
        >
          <AlertCircle size={32} />
        </div>
        <h1 className="display-4 fw-bold text-main mb-2">404</h1>
        <h5 className="fw-bold text-main mb-2">Page Not Found</h5>
        <p className="text-secondary small mb-4">
          The page or application resource you requested does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary-ct d-inline-flex align-items-center gap-2">
          <Home size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
