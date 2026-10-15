import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BriefcaseBusiness } from 'lucide-react';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column gap-3">
        <div
          className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-md"
          style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #800020, #A51D38)',
            boxShadow: '0 4px 12px rgba(128, 0, 32, 0.35)',
          }}
        >
          <BriefcaseBusiness size={24} strokeWidth={2.2} />
        </div>
        <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
          <span className="visually-hidden">Loading CareerTrack...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
