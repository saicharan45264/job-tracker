import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Sliders, Save, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { settingsApi } from '../api/notifications.api.js';
import { authApi } from '../api/auth.api.js';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      theme: 'light',
      defaultView: 'table',
      currency: 'USD',
      timeZone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPasswordVal = watchPassword('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        theme: user.preferences?.theme || 'light',
        defaultView: user.preferences?.defaultView || 'table',
        currency: user.preferences?.currency || 'USD',
        timeZone: user.preferences?.timeZone || 'UTC',
        dateFormat: user.preferences?.dateFormat || 'MM/DD/YYYY',
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = async (data) => {
    try {
      setProfileLoading(true);
      const res = await settingsApi.updateSettings({
        name: data.name,
        preferences: {
          theme: data.theme,
          defaultView: data.defaultView,
          currency: data.currency,
          timeZone: data.timeZone,
          dateFormat: data.dateFormat,
        },
      });
      updateUser(res.data);
      toast.success('Preferences updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setPasswordLoading(true);
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-main fs-3 tracking-tight">Account & Preferences</h2>
        <p className="text-secondary small mb-0">
          Manage your personal profile, workspace defaults, and security credentials
        </p>
      </div>

      <div className="row g-4">
        {/* Settings Navigation Tabs */}
        <div className="col-12 col-md-3">
          <div className="ct-card p-2 d-flex flex-column gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`btn btn-sm text-start d-flex align-items-center gap-2 p-2 rounded-2 ${activeTab === 'profile' ? 'btn-primary-ct text-white' : 'btn-light text-secondary'
                }`}
            >
              <User size={16} />
              <span className="fw-semibold">Profile & Defaults</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`btn btn-sm text-start d-flex align-items-center gap-2 p-2 rounded-2 ${activeTab === 'security' ? 'btn-primary-ct text-white' : 'btn-light text-secondary'
                }`}
            >
              <Shield size={16} />
              <span className="fw-semibold">Security & Password</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="col-12 col-md-9">
          {activeTab === 'profile' && (
            <div className="ct-card">
              <h5 className="fw-bold text-main mb-3">Profile Information</h5>
              <form onSubmit={handleSubmitProfile(onUpdateProfile)}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      {...registerProfile('name', { required: true })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      disabled
                      {...registerProfile('email')}
                    />
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Primary identifier for authentication
                    </span>
                  </div>
                </div>

                <h5 className="fw-bold text-main mb-3 pt-3 border-top">Workspace Preferences</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Default Application View</label>
                    <select className="form-select" {...registerProfile('defaultView')}>
                      <option value="table">Table View (Detailed rows)</option>
                      <option value="kanban">Kanban View (Visual pipeline cards)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Preferred Currency</label>
                    <select className="form-select" {...registerProfile('currency')}>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Date Format</label>
                    <select className="form-select" {...registerProfile('dateFormat')}>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Time Zone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. America/New_York or UTC"
                      {...registerProfile('timeZone')}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary-ct" disabled={profileLoading}>
                    <Save size={16} />
                    <span>{profileLoading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="ct-card">
              <h5 className="fw-bold text-main mb-3">Change Account Password</h5>
              <p className="text-secondary small mb-4">
                Ensure your password is at least 6 characters long and includes a mix of characters.
              </p>

              <form onSubmit={handleSubmitPassword(onChangePassword)} style={{ maxWidth: 480 }}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  />
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback">{passwordErrors.currentPassword.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                  {passwordErrors.newPassword && (
                    <div className="invalid-feedback">{passwordErrors.newPassword.message}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.confirmNewPassword ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    {...registerPassword('confirmNewPassword', {
                      required: 'Please confirm new password',
                      validate: (v) => v === newPasswordVal || 'New passwords do not match',
                    })}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <div className="invalid-feedback">{passwordErrors.confirmNewPassword.message}</div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary-ct" disabled={passwordLoading}>
                  <Lock size={16} />
                  <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
