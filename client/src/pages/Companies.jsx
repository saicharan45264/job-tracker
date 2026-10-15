import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  Globe,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  Briefcase,
  FolderOpen,
} from 'lucide-react';
import { companiesApi } from '../api/companies.api.js';
import { CompanyModal } from '../components/companies/CompanyModal.jsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [viewAppsCompany, setViewAppsCompany] = useState(null);
  const [companyApps, setCompanyApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getCompanies({
        search: search.trim() || undefined,
        industry: industryFilter || undefined,
      });
      setCompanies(res.data || []);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [search, industryFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setModalLoading(true);
      if (editingCompany) {
        await companiesApi.updateCompany(editingCompany._id, formData);
        toast.success('Company updated successfully');
        setEditingCompany(null);
      } else {
        await companiesApi.createCompany(formData);
        toast.success('Company added to directory');
        setIsModalOpen(false);
      }
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving company');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    try {
      setModalLoading(true);
      await companiesApi.deleteCompany(deletingCompany._id);
      toast.success('Company deleted successfully');
      setDeletingCompany(null);
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to delete company');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAppsModal = async (company) => {
    setViewAppsCompany(company);
    setAppsLoading(true);
    try {
      const res = await companiesApi.getCompanyApplications(company._id);
      setCompanyApps(res.data || []);
    } catch (err) {
      toast.error('Failed to load company applications');
    } finally {
      setAppsLoading(false);
    }
  };

  // Extract unique industries for filter
  const industries = Array.from(new Set(companies.map((c) => c.industry).filter(Boolean)));

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-main fs-3 tracking-tight">Company Directory</h2>
          <p className="text-secondary small mb-0">
            Maintain intelligence, research notes, and track applications by target company
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary-ct btn-sm">
          <Plus size={16} />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="ct-card mb-4 p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search companies by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3 text-end">
            {(search || industryFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setIndustryFilter('');
                }}
                className="btn btn-sm btn-link text-secondary text-decoration-none small"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSkeleton rows={4} height={120} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies in directory"
          description="Click '+ Add Company' to record company profiles and recruitment notes."
          actionLabel="Add New Company"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="row g-4">
          {companies.map((company) => (
            <div key={company._id} className="col-12 col-md-6 col-xl-4">
              <div className="ct-card h-100 d-flex flex-column justify-content-between ct-card-interactive">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-main mb-0">{company.name}</h5>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        onClick={() => setEditingCompany(company)}
                        className="btn btn-sm btn-light p-1 rounded-2 text-secondary"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingCompany(company)}
                        className="btn btn-sm btn-light p-1 rounded-2 text-danger"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                    {company.industry && (
                      <span className="badge bg-light text-secondary border small">
                        {company.industry}
                      </span>
                    )}
                    {company.location && (
                      <span className="d-flex align-items-center gap-1 text-muted small" style={{ fontSize: '0.75rem' }}>
                        <MapPin size={12} /> {company.location}
                      </span>
                    )}
                  </div>

                  {company.notes && (
                    <p className="text-secondary small mb-3 line-clamp-2" style={{ fontSize: '0.82rem' }}>
                      {company.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                  <button
                    onClick={() => handleOpenAppsModal(company)}
                    className="btn btn-sm btn-link text-primary p-0 d-flex align-items-center gap-1 text-decoration-none small fw-semibold"
                  >
                    <Briefcase size={14} />
                    <span>{company.applicationCount || 0} Applications</span>
                  </button>

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center gap-1 text-secondary small text-decoration-none"
                    >
                      <Globe size={14} />
                      <span>Website</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      <CompanyModal
        isOpen={isModalOpen || !!editingCompany}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCompany}
        loading={modalLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingCompany}
        title="Delete Company Record"
        message={`Are you sure you want to delete ${deletingCompany?.name}? Linked applications will remain safe.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCompany(null)}
        loading={modalLoading}
      />

      {/* View Company Applications Modal */}
      {viewAppsCompany && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-main">
                  Applications at {viewAppsCompany.name}
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle p-1"
                  onClick={() => setViewAppsCompany(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body p-4">
                {appsLoading ? (
                  <LoadingSkeleton rows={3} height={40} />
                ) : companyApps.length === 0 ? (
                  <p className="text-muted small text-center py-4">
                    No applications currently tracked for {viewAppsCompany.name}.
                  </p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {companyApps.map((app) => (
                      <div
                        key={app._id}
                        className="p-3 rounded-3 border d-flex align-items-center justify-content-between"
                        style={{ background: 'var(--surface-alt)' }}
                      >
                        <div>
                          <span className="fw-bold text-main small d-block">{app.jobTitle}</span>
                          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            Applied: {new Date(app.applicationDate).toLocaleDateString()} • {app.workArrangement}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-primary border small">{app.status}</span>
                          <Link
                            to={`/applications/${app._id}`}
                            onClick={() => setViewAppsCompany(null)}
                            className="btn btn-sm btn-outline-primary py-1 px-2 small"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
