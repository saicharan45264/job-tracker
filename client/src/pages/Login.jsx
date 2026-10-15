import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BriefcaseBusiness, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await login(data);
      toast.success('Welcome back to CareerTrack!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'demo@careertrack.dev');
    setValue('password', 'Password123!');
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{
        background: 'linear-gradient(135deg, #FDF2F4 0%, #F7F8FC 50%, #FAF0F2 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: 440 }}>
        {/* Brand */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center text-white rounded-3 shadow-md mb-3"
            style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #800020, #A51D38)',
              boxShadow: '0 4px 12px rgba(128, 0, 32, 0.35)',
            }}
          >
            <BriefcaseBusiness size={28} strokeWidth={2.2} />
          </div>
          <h2 className="fw-bold text-main tracking-tight mb-1">CareerTrack</h2>
          <p className="text-secondary small">Your career journey, organized.</p>
        </div>

        {/* Card */}
        <div className="ct-card border-0 shadow-lg p-4 p-sm-5 bg-white rounded-4">
          <h4 className="fw-bold text-main mb-1">Sign In</h4>
          <p className="text-secondary small mb-4">
            Enter your credentials to access your job applications
          </p>

          {/* Quick Demo Credentials Banner */}
          <div
            className="p-3 mb-4 rounded-3 d-flex align-items-center justify-content-between"
            style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)' }}
          >
            <div>
              <span className="fw-bold small text-primary d-block">College Viva / Demo Mode</span>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                demo@careertrack.dev | Password123!
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-sm btn-primary-ct py-1 px-2"
              style={{ fontSize: '0.75rem' }}
            >
              Auto-Fill
            </button>
          </div>

          {serverError && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-main">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <div className="text-danger small mt-1">{errors.email.message}</div>
              )}
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label small fw-semibold text-main mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control border-start-0 border-end-0 ${
                    errors.password ? 'is-invalid' : ''
                  }`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0 text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div className="text-danger small mt-1">{errors.password.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary-ct w-100 py-2 justify-content-center"
              disabled={loading}
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-secondary small mb-0">
              Don't have an account yet?{' '}
              <Link to="/register" className="fw-semibold text-primary">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
