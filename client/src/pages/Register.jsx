import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BriefcaseBusiness, Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await registerUser(data);
      toast.success('Account created successfully! Welcome to CareerTrack.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{
        background: 'linear-gradient(135deg, #FDF2F4 0%, #F7F8FC 50%, #FAF0F2 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: 460 }}>
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
          <h4 className="fw-bold text-main mb-1">Create Account</h4>
          <p className="text-secondary small mb-4">
            Track your recruitment pipelines with precision
          </p>

          {serverError && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-main">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className={`form-control border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Alex Morgan"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
              </div>
              {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
            </div>

            {/* Email */}
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
              {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-main">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control border-start-0 border-end-0 ${
                    errors.password ? 'is-invalid' : ''
                  }`}
                  placeholder="At least 6 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
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

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-main">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control border-start-0 ${
                    errors.confirmPassword ? 'is-invalid' : ''
                  }`}
                  placeholder="Re-enter password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordVal || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary-ct w-100 py-2 justify-content-center"
              disabled={loading}
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-secondary small mb-0">
              Already registered?{' '}
              <Link to="/login" className="fw-semibold text-primary">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
