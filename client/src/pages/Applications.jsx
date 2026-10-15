import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Download,
  Search,
  Filter,
  Columns,
  List,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Building,
  Calendar,
} from 'lucide-react';
import { applicationsApi } from '../api/applications.api.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../components/common/PriorityBadge.jsx';
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal.jsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  APPLICATION_STATUSES,
  APPLICATION_PRIORITIES,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  APPLICATION_SOURCES,
} from '../utils/constants.js';
import toast from 'react-hot-toast';

export const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // View state: 'table' or 'kanban'
  const [viewMode, setViewMode] = useState('table');

  // Query state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [workArrangementFilter, setWorkArrangementFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Data state
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Status update inline popover
  const [activeStatusMenu, setActiveStatusMenu] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        workArrangement: workArrangementFilter || undefined,
        source: sourceFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: viewMode === 'kanban' ? 100 : limit,
      };

      const res = await applicationsApi.getApplications(params);
      setApplications(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, workArrangementFilter, sourceFilter, sortBy, sortOrder, page, limit, viewMode]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Sync search param from url
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  const handleCreate = async (formData) => {
    try {
      setModalLoading(true);
      await applicationsApi.createApplication(formData);
      toast.success('Application created successfully');
      setIsAddModalOpen(false);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating application');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingApp) return;
    try {
      setModalLoading(true);
      await applicationsApi.updateApplication(editingApp._id, formData);
      toast.success('Application updated successfully');
      setEditingApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating application');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    try {
      setModalLoading(true);
      await applicationsApi.deleteApplication(deletingApp._id);
      toast.success('Application deleted successfully');
      setDeletingApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting application');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      toast.success(`Application moved to ${newStatus}`);
      setActiveStatusMenu(null);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.loading('Generating CSV export...', { id: 'csv-export' });
      const blobData = await applicationsApi.exportCsv({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
      });

      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `careertrack-applications-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Applications exported to CSV!', { id: 'csv-export' });
    } catch (err) {
      toast.error('Failed to export CSV', { id: 'csv-export' });
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-main fs-3 tracking-tight">Job Applications</h2>
          <p className="text-secondary small mb-0">
            Manage, filter, and track all your recruitment pipelines in one place
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="btn-group border rounded-3 p-1 bg-white shadow-sm" role="group">
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm d-flex align-items-center gap-1 ${
                viewMode === 'table' ? 'btn-primary-ct py-1 px-2 text-white' : 'btn-light py-1 px-2'
              }`}
            >
              <List size={15} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`btn btn-sm d-flex align-items-center gap-1 ${
                viewMode === 'kanban' ? 'btn-primary-ct py-1 px-2 text-white' : 'btn-light py-1 px-2'
              }`}
            >
              <Columns size={15} />
              <span>Kanban</span>
            </button>
          </div>

          {/* Export to CSV */}
          <button onClick={handleExportCsv} className="btn btn-secondary-ct btn-sm shadow-sm">
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {/* Add Application */}
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary-ct btn-sm shadow-sm">
            <Plus size={16} />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ct-card mb-4 p-3">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by company, role, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              {APPLICATION_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Work Arrangement */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={workArrangementFilter}
              onChange={(e) => {
                setWorkArrangementFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Arrangements</option>
              {WORK_ARRANGEMENTS.map((wa) => (
                <option key={wa} value={wa}>
                  {wa}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-6 col-md-2 text-end">
            {(search || statusFilter || priorityFilter || workArrangementFilter || sourceFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setPriorityFilter('');
                  setWorkArrangementFilter('');
                  setSourceFilter('');
                  setPage(1);
                }}
                className="btn btn-sm btn-link text-secondary text-decoration-none small"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Table vs Kanban */}
      {loading ? (
        <LoadingSkeleton rows={8} height={48} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications match your criteria"
          description="Try clearing your filters or click '+ Track Application' to record a new application."
          actionLabel="Add New Application"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="ct-card p-0 overflow-hidden shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('company')}
                    className="border-0 px-3 py-3"
                  >
                    Company & Role {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('applicationDate')}
                    className="border-0"
                  >
                    Applied Date {sortBy === 'applicationDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('status')}
                    className="border-0"
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('priority')}
                    className="border-0"
                  >
                    Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="border-0">Arrangement</th>
                  <th className="border-0">Next Interview</th>
                  <th className="border-0 text-end px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="px-3">
                      <Link
                        to={`/applications/${app._id}`}
                        className="fw-bold text-main text-decoration-none small d-block"
                      >
                        {app.company}
                      </Link>
                      <span className="text-secondary small">{app.jobTitle}</span>
                    </td>
                    <td className="small text-secondary">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="position-relative d-inline-block">
                        <button
                          onClick={() =>
                            setActiveStatusMenu(activeStatusMenu === app._id ? null : app._id)
                          }
                          className="btn btn-sm p-0 border-0"
                          title="Click to change status"
                        >
                          <StatusBadge status={app.status} size="sm" />
                        </button>
                        {activeStatusMenu === app._id && (
                          <div
                            className="position-absolute start-0 mt-1 bg-white border rounded-3 shadow-lg py-1"
                            style={{ width: 150, zIndex: 1040 }}
                          >
                            <span className="px-3 py-1 text-muted d-block" style={{ fontSize: '0.7rem' }}>
                              MOVE STATUS:
                            </span>
                            {APPLICATION_STATUSES.map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(app._id, st)}
                                className={`dropdown-item px-3 py-1 small ${
                                  app.status === st ? 'fw-bold text-primary bg-light' : ''
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={app.priority} size="sm" />
                    </td>
                    <td className="small text-secondary">{app.workArrangement}</td>
                    <td>
                      {app.nextInterview ? (
                        <div className="d-flex align-items-center gap-1 text-primary small fw-semibold">
                          <Calendar size={13} />
                          <span>
                            {new Date(app.nextInterview.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="text-end px-3">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <Link
                          to={`/applications/${app._id}`}
                          className="btn btn-sm btn-light p-1 rounded-2 text-secondary"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => setEditingApp(app)}
                          className="btn btn-sm btn-light p-1 rounded-2 text-secondary"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingApp(app)}
                          className="btn btn-sm btn-light p-1 rounded-2 text-danger"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <span className="text-secondary small">
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, pagination.total)} of {pagination.total} applications
            </span>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-light border px-2 py-1"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="small fw-semibold text-main px-2">
                Page {page} of {pagination.totalPages || 1}
              </span>
              <button
                className="btn btn-sm btn-light border px-2 py-1"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="kanban-board">
          {APPLICATION_STATUSES.map((statusCol) => {
            const columnApps = applications.filter((a) => a.status === statusCol);
            return (
              <div key={statusCol} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-main small">{statusCol}</span>
                    <span className="badge rounded-pill bg-white border text-secondary small">
                      {columnApps.length}
                    </span>
                  </div>
                </div>

                <div className="kanban-column-cards">
                  {columnApps.length === 0 ? (
                    <div className="p-3 text-center text-muted small border rounded-3 border-dashed">
                      No applications
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div key={app._id} className="kanban-card">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <Link
                            to={`/applications/${app._id}`}
                            className="fw-bold text-main text-decoration-none small"
                          >
                            {app.company}
                          </Link>
                          <PriorityBadge priority={app.priority} size="sm" />
                        </div>
                        <p className="text-secondary small mb-2 text-truncate" style={{ fontSize: '0.8rem' }}>
                          {app.jobTitle}
                        </p>

                        {app.nextInterview && (
                          <div
                            className="p-1 px-2 rounded-2 mb-2 d-flex align-items-center gap-1 small"
                            style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '0.72rem' }}
                          >
                            <Calendar size={12} />
                            <span>
                              Interview: {new Date(app.nextInterview.scheduledAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="d-flex align-items-center justify-content-between border-top pt-2 mt-2">
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {new Date(app.applicationDate).toLocaleDateString()}
                          </span>
                          <div className="dropdown">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              className="form-select form-select-sm py-0 px-2"
                              style={{ fontSize: '0.72rem', height: 24, width: 100 }}
                            >
                              {APPLICATION_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Application Modal */}
      <ApplicationFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreate}
        loading={modalLoading}
      />

      {/* Edit Application Modal */}
      <ApplicationFormModal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        onSubmit={handleUpdate}
        initialData={editingApp}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingApp}
        title="Delete Job Application"
        message={`Are you sure you want to delete ${deletingApp?.company} - ${deletingApp?.jobTitle}? All linked interviews and timeline activity will also be removed.`}
        confirmLabel="Delete Application"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingApp(null)}
        loading={modalLoading}
      />
    </div>
  );
};
