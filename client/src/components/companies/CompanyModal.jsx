import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Building, Globe, MapPin, Tag } from 'lucide-react';

export const CompanyModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      location: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        website: '',
        industry: '',
        location: '',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-main">
              {initialData ? 'Edit Company' : 'Add New Company'}
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1"
              onClick={onClose}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Company Name *</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Building size={16} />
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Stripe, OpenAI, GitHub"
                    {...register('name', { required: 'Company name is required' })}
                  />
                </div>
                {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Website</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Globe size={16} />
                  </span>
                  <input
                    type="url"
                    className="form-control border-start-0"
                    placeholder="https://company.com"
                    {...register('website')}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Industry</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <Tag size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="e.g. Fintech, SaaS"
                      {...register('industry')}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Location / HQ</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="e.g. San Francisco, CA"
                      {...register('location')}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold">Company Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Culture insights, engineering blog notes, tech stack details..."
                  {...register('notes')}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button
                type="button"
                className="btn btn-secondary-ct"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary-ct" disabled={loading}>
                <span>{loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Company'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
