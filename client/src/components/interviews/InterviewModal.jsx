import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Calendar, Video, Clock, UserCheck, Plus, Trash2 } from 'lucide-react';
import { INTERVIEW_TYPES, INTERVIEW_MODES, INTERVIEW_OUTCOMES } from '../../utils/constants.js';

export const InterviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  applications = [],
  defaultApplicationId = '',
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      applicationId: defaultApplicationId || '',
      round: '',
      type: 'Technical Interview',
      scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      durationMinutes: 45,
      mode: 'Online',
      meetingLink: '',
      location: '',
      interviewers: '',
      notes: '',
      outcome: 'Pending',
      feedback: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'preparationChecklist',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        applicationId: initialData.applicationId?._id || initialData.applicationId || '',
        scheduledAt: initialData.scheduledAt
          ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
          : '',
        interviewers: Array.isArray(initialData.interviewers)
          ? initialData.interviewers.join(', ')
          : '',
        preparationChecklist: initialData.preparationChecklist || [],
      });
    } else {
      reset({
        applicationId: defaultApplicationId || (applications[0]?._id ?? ''),
        round: '',
        type: 'Technical Interview',
        scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        durationMinutes: 45,
        mode: 'Online',
        meetingLink: '',
        location: '',
        interviewers: '',
        notes: '',
        outcome: 'Pending',
        feedback: '',
        preparationChecklist: [
          { item: 'Review resume & key project stories', completed: false },
          { item: 'Prepare questions for the interviewer', completed: false },
        ],
      });
    }
  }, [initialData, defaultApplicationId, applications, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    const formatted = {
      ...data,
      durationMinutes: Number(data.durationMinutes),
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      interviewers: data.interviewers
        ? data.interviewers
            .split(',')
            .map((i) => i.trim())
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
              {initialData ? 'Edit Scheduled Interview' : 'Schedule New Interview'}
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
              <div className="row g-3">
                {/* Application select */}
                <div className="col-md-12">
                  <label className="form-label small fw-semibold">Target Job Application *</label>
                  <select
                    className={`form-select ${errors.applicationId ? 'is-invalid' : ''}`}
                    {...register('applicationId', { required: 'Please select an application' })}
                    disabled={!!defaultApplicationId && !initialData}
                  >
                    <option value="">Select an application...</option>
                    {applications.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.company} — {app.jobTitle} ({app.status})
                      </option>
                    ))}
                  </select>
                  {errors.applicationId && (
                    <div className="invalid-feedback">{errors.applicationId.message}</div>
                  )}
                </div>

                {/* Round */}
                <div className="col-md-7">
                  <label className="form-label small fw-semibold">Interview Round Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.round ? 'is-invalid' : ''}`}
                    placeholder="e.g. Round 2: System Design & Architecture"
                    {...register('round', { required: 'Round name is required' })}
                  />
                  {errors.round && <div className="invalid-feedback">{errors.round.message}</div>}
                </div>

                {/* Type */}
                <div className="col-md-5">
                  <label className="form-label small fw-semibold">Interview Type</label>
                  <select className="form-select" {...register('type')}>
                    {INTERVIEW_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheduled At */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Date & Time *</label>
                  <input
                    type="datetime-local"
                    className={`form-control ${errors.scheduledAt ? 'is-invalid' : ''}`}
                    {...register('scheduledAt', { required: 'Date and time are required' })}
                  />
                </div>

                {/* Duration */}
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Duration (Minutes)</label>
                  <input
                    type="number"
                    step="5"
                    className="form-control"
                    placeholder="45"
                    {...register('durationMinutes')}
                  />
                </div>

                {/* Mode */}
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Mode</label>
                  <select className="form-select" {...register('mode')}>
                    {INTERVIEW_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meeting Link */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Meeting Video Link</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://meet.google.com/... or zoom.us"
                    {...register('meetingLink')}
                  />
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Location / Office Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Headquarters 4th Floor or Online"
                    {...register('location')}
                  />
                </div>

                {/* Interviewers */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    Interviewers (Names / Titles, comma separated)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Elena Rostova (Hiring Mgr), David Chen (Staff Eng)"
                    {...register('interviewers')}
                  />
                </div>

                {/* Outcome & Feedback (if editing) */}
                {initialData && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Interview Outcome</label>
                      <select className="form-select" {...register('outcome')}>
                        {INTERVIEW_OUTCOMES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Interviewer Feedback</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Feedback received from recruiter or team"
                        {...register('feedback')}
                      />
                    </div>
                  </>
                )}

                {/* Preparation Checklist */}
                <div className="col-12 mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label small fw-semibold mb-0">
                      Preparation Checklist Tasks
                    </label>
                    <button
                      type="button"
                      onClick={() => append({ item: '', completed: false })}
                      className="btn btn-sm btn-link text-primary p-0 d-flex align-items-center gap-1 small text-decoration-none"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                  {fields.map((field, idx) => (
                    <div key={field.id} className="d-flex align-items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        {...register(`preparationChecklist.${idx}.completed`)}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Task description..."
                        {...register(`preparationChecklist.${idx}.item`, { required: true })}
                      />
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="btn btn-sm text-danger p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Preparation Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Focus topics, system design questions to review, etc."
                    {...register('notes')}
                  ></textarea>
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
                <span>{loading ? 'Saving...' : initialData ? 'Update Interview' : 'Schedule Interview'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
