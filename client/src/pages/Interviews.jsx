import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  CheckSquare,
  Square,
  Edit,
  Trash2,
  Building,
} from 'lucide-react';
import { interviewsApi } from '../api/interviews.api.js';
import { applicationsApi } from '../api/applications.api.js';
import { InterviewModal } from '../components/interviews/InterviewModal.jsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';

export const Interviews = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarInterviews, setCalendarInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deletingInterview, setDeletingInterview] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [calRes, upRes, appsRes] = await Promise.all([
        interviewsApi.getCalendar({ month, year }),
        interviewsApi.getUpcoming(),
        applicationsApi.getApplications({ limit: 100 }),
      ]);
      setCalendarInterviews(calRes.data || []);
      setUpcomingInterviews(upRes.data || []);
      setApplications(appsRes.data || []);
    } catch (err) {
      toast.error('Failed to load interview calendar');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      setModalLoading(true);
      if (editingInterview) {
        await interviewsApi.updateInterview(editingInterview._id, formData);
        toast.success('Interview updated');
        setEditingInterview(null);
      } else {
        await interviewsApi.createInterview(formData);
        toast.success('Interview scheduled');
        setIsModalOpen(false);
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving interview');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInterview) return;
    try {
      setModalLoading(true);
      await interviewsApi.deleteInterview(deletingInterview._id);
      toast.success('Interview deleted');
      setDeletingInterview(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete interview');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOutcomeChange = async (id, outcome) => {
    try {
      await interviewsApi.updateOutcome(id, outcome);
      toast.success(`Marked as ${outcome}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update outcome');
    }
  };

  // Build Calendar Days
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const today = new Date();

  const calendarDays = [];
  // Padding for previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ dayNumber: null, isCurrentMonth: false });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === d;
    calendarDays.push({ dayNumber: d, isCurrentMonth: true, isToday });
  }

  // Group interviews by day of month
  const interviewsByDay = {};
  calendarInterviews.forEach((interview) => {
    const dt = new Date(interview.scheduledAt);
    if (dt.getFullYear() === year && dt.getMonth() + 1 === month) {
      const day = dt.getDate();
      if (!interviewsByDay[day]) interviewsByDay[day] = [];
      interviewsByDay[day].push(interview);
    }
  });

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-main fs-3 tracking-tight">Interview Calendar</h2>
          <p className="text-secondary small mb-0">
            Keep track of rounds, prepare for technical screens, and manage outcomes
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary-ct btn-sm">
          <Plus size={16} />
          <span>Schedule Interview</span>
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Monthly Calendar Grid */}
        <div className="col-12 col-xl-8">
          <div className="ct-card">
            {/* Month Navigation */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold text-main mb-0">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="btn btn-sm btn-light border p-1 rounded-2"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="btn btn-sm btn-light border px-2 py-1 small fw-semibold"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="btn btn-sm btn-light border p-1 rounded-2"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="d-grid text-center mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d} className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <div key={idx} className="calendar-cell outside-month"></div>;
                }
                const dayInterviews = interviewsByDay[cell.dayNumber] || [];
                return (
                  <div
                    key={idx}
                    className={`calendar-cell ${cell.isToday ? 'today' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span
                        className={`small fw-bold ${
                          cell.isToday
                            ? 'badge bg-primary text-white rounded-circle p-1 px-2'
                            : 'text-main'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {dayInterviews.length > 0 && (
                        <span className="badge rounded-pill bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                          {dayInterviews.length}
                        </span>
                      )}
                    </div>
                    <div className="d-flex flex-column gap-1 overflow-hidden">
                      {dayInterviews.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => setEditingInterview(item)}
                          className="p-1 rounded text-truncate cursor-pointer"
                          style={{
                            background: item.outcome === 'Passed' ? '#DCFCE7' : '#EEF2FF',
                            color: item.outcome === 'Passed' ? '#166534' : '#4338CA',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title={`${item.applicationId?.company || 'Company'}: ${item.round}`}
                        >
                          {item.applicationId?.company || 'Job'}: {item.round}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Interviews List */}
        <div className="col-12 col-xl-4">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-3">Upcoming Schedules</h6>

            {upcomingInterviews.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No upcoming interviews"
                description="Use the button above to schedule your next interview round."
              />
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingInterviews.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-3 border"
                    style={{ background: 'var(--surface-alt)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="fw-bold text-main small">
                        {item.applicationId?.company || 'Company'}
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          onClick={() => setEditingInterview(item)}
                          className="btn btn-sm btn-link text-secondary p-0"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingInterview(item)}
                          className="btn btn-sm btn-link text-danger p-0"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-secondary small mb-2" style={{ fontSize: '0.8rem' }}>
                      {item.round} ({item.type})
                    </p>

                    <div className="d-flex align-items-center gap-2 text-secondary mb-2" style={{ fontSize: '0.75rem' }}>
                      <Clock size={13} className="text-primary" />
                      <span>{new Date(item.scheduledAt).toLocaleString()}</span>
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

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Mode: {item.mode}
                      </span>
                      <select
                        value={item.outcome}
                        onChange={(e) => handleOutcomeChange(item._id, e.target.value)}
                        className="form-select form-select-sm py-0 px-2"
                        style={{ fontSize: '0.72rem', height: 24, width: 95 }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule / Edit Modal */}
      <InterviewModal
        isOpen={isModalOpen || !!editingInterview}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingInterview}
        applications={applications}
        loading={modalLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingInterview}
        title="Delete Interview"
        message="Are you sure you want to delete this scheduled interview?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingInterview(null)}
        loading={modalLoading}
      />
    </div>
  );
};
