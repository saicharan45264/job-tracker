import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  Globe,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  User,
  Clock,
  Plus,
  Edit,
  Trash2,
  Video,
  CheckCircle,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { applicationsApi } from '../api/applications.api.js';
import { interviewsApi } from '../api/interviews.api.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../components/common/PriorityBadge.jsx';
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal.jsx';
import { InterviewModal } from '../components/interviews/InterviewModal.jsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { APPLICATION_STATUSES } from '../utils/constants.js';
import toast from 'react-hot-toast';

export const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getApplicationById(id);
      setApplication(res.data);
    } catch (err) {
      toast.error('Failed to load application details');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setModalLoading(true);
      await applicationsApi.updateApplication(id, formData);
      toast.success('Application updated successfully');
      setIsEditModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to update application');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      await applicationsApi.deleteApplication(id);
      toast.success('Application deleted');
      navigate('/applications');
    } catch (err) {
      toast.error('Failed to delete application');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await applicationsApi.updateStatus(id, newStatus);
      toast.success(`Moved to ${newStatus}`);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleScheduleInterview = async (formData) => {
    try {
      setModalLoading(true);
      await interviewsApi.createInterview({ ...formData, applicationId: id });
      toast.success('Interview scheduled successfully');
      setIsInterviewModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to schedule interview');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOutcomeChange = async (interviewId, outcome) => {
    try {
      await interviewsApi.updateOutcome(interviewId, outcome);
      toast.success(`Interview marked as ${outcome}`);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to update interview outcome');
    }
  };

  if (loading || !application) {
    return (
      <div className="py-4">
        <LoadingSkeleton rows={6} height={50} />
      </div>
    );
  }

  const interviews = application.interviews || [];
  const activities = application.activities || [];

  return (
    <div>
      {/* Top Breadcrumb & Action bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/applications" className="btn btn-sm btn-light border rounded-circle p-2">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h2 className="fw-bold mb-0 text-main fs-3 tracking-tight">
                {application.company}
              </h2>
              <StatusBadge status={application.status} />
              <PriorityBadge priority={application.priority} />
            </div>
            <p className="text-secondary small mb-0">{application.jobTitle}</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Quick status selector */}
          <select
            value={application.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="form-select form-select-sm"
            style={{ width: 140 }}
          >
            {APPLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsInterviewModalOpen(true)}
            className="btn btn-primary-ct btn-sm"
          >
            <Plus size={15} />
            <span>Schedule Interview</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary-ct btn-sm"
          >
            <Edit size={15} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-light border text-danger btn-sm"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Job & Company Details */}
        <div className="col-12 col-lg-8">
          {/* Main Info Card */}
          <div className="ct-card mb-4">
            <h6 className="fw-bold text-main mb-3">Position Overview</h6>
            <div className="row g-3">
              <div className="col-sm-6 col-md-4">
                <span className="text-secondary small d-block">Work Arrangement</span>
                <span className="fw-semibold text-main small">{application.workArrangement}</span>
              </div>
              <div className="col-sm-6 col-md-4">
                <span className="text-secondary small d-block">Employment Type</span>
                <span className="fw-semibold text-main small">{application.employmentType}</span>
              </div>
              <div className="col-sm-6 col-md-4">
                <span className="text-secondary small d-block">Experience Level</span>
                <span className="fw-semibold text-main small">
                  {application.experienceLevel || 'Not specified'}
                </span>
              </div>
              <div className="col-sm-6 col-md-4">
                <span className="text-secondary small d-block">Compensation</span>
                <span className="fw-semibold text-main small">
                  {application.salaryMin
                    ? `${application.currency} ${application.salaryMin.toLocaleString()}${
                        application.salaryMax ? ` - ${application.salaryMax.toLocaleString()}` : ''
                      }`
                    : 'Not disclosed'}
                </span>
              </div>
              <div className="col-sm-6 col-md-4">
                <span className="text-secondary small d-block">Application Date</span>
                <span className="fw-semibold text-main small">
                  {new Date(application.applicationDate).toLocaleDateString()}
                </span>
              </div>
              <div className="col-sm-6 col-md-4">
                <span className="text-secondary small d-block">Source</span>
                <span className="fw-semibold text-main small">{application.source}</span>
              </div>
            </div>

            {/* Links */}
            {(application.jobUrl || application.companyWebsite || application.location) && (
              <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top flex-wrap">
                {application.location && (
                  <span className="d-flex align-items-center gap-1 text-secondary small">
                    <MapPin size={14} className="text-primary" />
                    {application.location}
                  </span>
                )}
                {application.companyWebsite && (
                  <a
                    href={application.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="d-flex align-items-center gap-1 text-primary small text-decoration-none"
                  >
                    <Globe size={14} />
                    Company Site
                    <ExternalLink size={12} />
                  </a>
                )}
                {application.jobUrl && (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="d-flex align-items-center gap-1 text-primary small text-decoration-none"
                  >
                    <Briefcase size={14} />
                    Job Posting
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Recruiter & Notes Card */}
          <div className="ct-card mb-4">
            <h6 className="fw-bold text-main mb-3">Recruiter & Application Notes</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <span className="text-secondary small d-block">Recruiter</span>
                <span className="fw-semibold text-main small">
                  {application.recruiterName || 'None assigned'}
                </span>
              </div>
              <div className="col-md-4">
                <span className="text-secondary small d-block">Email</span>
                <span className="fw-semibold text-main small">
                  {application.recruiterEmail ? (
                    <a href={`mailto:${application.recruiterEmail}`} className="text-primary">
                      {application.recruiterEmail}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="col-md-4">
                <span className="text-secondary small d-block">Phone / Contact</span>
                <span className="fw-semibold text-main small">
                  {application.recruiterPhone || '—'}
                </span>
              </div>
            </div>

            {application.tags && application.tags.length > 0 && (
              <div className="mb-3">
                <span className="text-secondary small d-block mb-1">Tags</span>
                <div className="d-flex gap-1 flex-wrap">
                  {application.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="badge bg-light text-secondary border small px-2 py-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {application.notes && (
              <div>
                <span className="text-secondary small d-block mb-1">Notes</span>
                <div
                  className="p-3 bg-light rounded-3 text-main small"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {application.notes}
                </div>
              </div>
            )}
          </div>

          {/* Associated Interviews */}
          <div className="ct-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-main mb-0">Interview Rounds ({interviews.length})</h6>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="btn btn-sm btn-link text-primary text-decoration-none p-0 d-flex align-items-center gap-1 small fw-semibold"
              >
                <Plus size={14} /> Schedule Round
              </button>
            </div>

            {interviews.length === 0 ? (
              <p className="text-muted small mb-0">No interview rounds scheduled yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {interviews.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-3 border"
                    style={{ background: 'var(--surface-alt)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-2">
                      <div>
                        <span className="fw-bold text-main small d-block">{item.round}</span>
                        <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                          {item.type} • {item.mode} • {item.durationMinutes} mins
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge small ${
                            item.outcome === 'Passed'
                              ? 'bg-success text-white'
                              : item.outcome === 'Failed'
                              ? 'bg-danger text-white'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {item.outcome}
                        </span>
                        <select
                          value={item.outcome}
                          onChange={(e) => handleOutcomeChange(item._id, e.target.value)}
                          className="form-select form-select-sm py-0 px-2"
                          style={{ fontSize: '0.72rem', height: 26, width: 110 }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 text-secondary mb-2" style={{ fontSize: '0.78rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={13} className="text-primary" />
                        {new Date(item.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    {item.meetingLink && (
                      <div className="mb-2">
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <Video size={13} /> Join Meeting
                        </a>
                      </div>
                    )}

                    {item.feedback && (
                      <div className="mt-2 p-2 bg-white rounded border small text-secondary">
                        <span className="fw-semibold text-main">Feedback: </span>
                        {item.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="col-12 col-lg-4">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-3">Activity Timeline</h6>

            {activities.length === 0 ? (
              <p className="text-muted small">No activity recorded.</p>
            ) : (
              <div className="position-relative ps-3" style={{ borderLeft: '2px solid #E7E9F2' }}>
                {activities.map((act) => (
                  <div key={act._id} className="mb-4 position-relative">
                    {/* Timeline dot */}
                    <div
                      className="position-absolute rounded-circle"
                      style={{
                        width: 10,
                        height: 10,
                        background: 'var(--primary)',
                        left: -21,
                        top: 4,
                      }}
                    />
                    <p className="fw-semibold small text-main mb-1">{act.message}</p>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ApplicationFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={application}
        loading={modalLoading}
      />

      {/* Schedule Interview Modal */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSubmit={handleScheduleInterview}
        defaultApplicationId={application._id}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Application"
        message={`Are you sure you want to delete ${application.company} - ${application.jobTitle}?`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={modalLoading}
      />
    </div>
  );
};
