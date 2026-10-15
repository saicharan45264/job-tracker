import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Building, Briefcase, DollarSign, Calendar, Tag, UserCheck } from 'lucide-react';
import {
  APPLICATION_STATUSES,
  APPLICATION_PRIORITIES,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  APPLICATION_SOURCES,
} from '../../utils/constants.js';

export const ApplicationFormModal = ({
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
      company: '',
      jobTitle: '',
      jobDescription: '',
      jobUrl: '',
      companyWebsite: '',
      location: '',
      workArrangement: 'Remote',
      employmentType: 'Full-time',
      experienceLevel: 'Entry-level',
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      source: 'LinkedIn',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      priority: 'Medium',
      recruiterName: '',
      recruiterEmail: '',
      recruiterPhone: '',
      notes: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        salaryMin: initialData.salaryMin ?? '',
        salaryMax: initialData.salaryMax ?? '',
        applicationDate: initialData.applicationDate
          ? new Date(initialData.applicationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    } else {
      reset({
        company: '',
        jobTitle: '',
        jobDescription: '',
        jobUrl: '',
        companyWebsite: '',
        location: '',
        workArrangement: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: 'Entry-level',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        source: 'LinkedIn',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        priority: 'Medium',
        recruiterName: '',
        recruiterEmail: '',
        recruiterPhone: '',
        notes: '',
        tags: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    const formatted = {
      ...data,
      salaryMin: data.salaryMin !== '' ? Number(data.salaryMin) : null,
      salaryMax: data.salaryMax !== '' ? Number(data.salaryMax) : null,
      tags: data.tags
        ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        : [],
    };
    onSubmit(formatted);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-main">
              {initialData ? 'Edit Job Application' : 'Track New Job Application'}
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

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Section 1: Job Information */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                  <Briefcase size={16} /> 1. Job Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-7">
                    <label className="form-label small fw-semibold">Job Title *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.jobTitle ? 'is-invalid' : ''}`}
                      placeholder="e.g. Senior Full Stack Engineer"
                      {...register('jobTitle', { required: 'Job title is required' })}
                    />
                    {errors.jobTitle && (
                      <div className="invalid-feedback">{errors.jobTitle.message}</div>
                    )}
                  </div>
                  <div className="col-md-5">
                    <label className="form-label small fw-semibold">Work Arrangement</label>
                    <select className="form-select" {...register('workArrangement')}>
                      {WORK_ARRANGEMENTS.map((wa) => (
                        <option key={wa} value={wa}>
                          {wa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Employment Type</label>
                    <select className="form-select" {...register('employmentType')}>
                      {EMPLOYMENT_TYPES.map((et) => (
                        <option key={et} value={et}>
                          {et}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Experience Level</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Mid-Level, Senior"
                      {...register('experienceLevel')}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Job Posting URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://company.com/careers/job-id"
                      {...register('jobUrl')}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Company Information */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                  <Building size={16} /> 2. Company Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Company Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.company ? 'is-invalid' : ''}`}
                      placeholder="e.g. Stripe, Google, Figma"
                      {...register('company', { required: 'Company name is required' })}
                    />
                    {errors.company && (
                      <div className="invalid-feedback">{errors.company.message}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Company Website</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://stripe.com"
                      {...register('companyWebsite')}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-semibold">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. San Francisco, CA / Remote"
                      {...register('location')}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Status & Priority */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                  <Calendar size={16} /> 3. Application Status & Timeline
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Status *</label>
                    <select className="form-select" {...register('status')}>
                      {APPLICATION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Priority *</label>
                    <select className="form-select" {...register('priority')}>
                      {APPLICATION_PRIORITIES.map((pr) => (
                        <option key={pr} value={pr}>
                          {pr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Application Date</label>
                    <input type="date" className="form-control" {...register('applicationDate')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Source</label>
                    <select className="form-select" {...register('source')}>
                      {APPLICATION_SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Compensation */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                  <DollarSign size={16} /> 4. Compensation
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Currency</label>
                    <select className="form-select" {...register('currency')}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Salary Minimum</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 120000"
                      {...register('salaryMin')}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Salary Maximum</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 150000"
                      {...register('salaryMax')}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Recruiter Information */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                  <UserCheck size={16} /> 5. Recruiter & Contact Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Recruiter Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sarah Jenkins"
                      {...register('recruiterName')}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Recruiter Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="recruiter@company.com"
                      {...register('recruiterEmail')}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Phone / Contact</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      {...register('recruiterPhone')}
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Notes & Tags */}
              <div>
                <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                  <Tag size={16} /> 6. Notes & Tags
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. React, Node.js, Fintech, High Priority"
                      {...register('tags')}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Application Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Notes about team, tech stack, referral context..."
                      {...register('notes')}
                    ></textarea>
                  </div>
                </div>
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
                <Save size={16} />
                <span>{loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Application'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
