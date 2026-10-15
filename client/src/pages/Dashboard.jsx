import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileCheck,
  CalendarCheck,
  Sparkles,
  XCircle,
  TrendingUp,
  Video,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dashboardApi } from '../api/dashboard.api.js';
import { StatCard } from '../components/common/StatCard.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../components/common/PriorityBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const STATUS_COLORS = {
  Wishlist: '#8F9CA8',
  Applied: '#800020',
  Assessment: '#B85D19',
  Interview: '#9E2A2B',
  Offer: '#1F7A50',
  Rejected: '#A71D2A',
  Withdrawn: '#64748B',
};

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [trends, setTrends] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [sourceDist, setSourceDist] = useState([]);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, appsRes, interviewsRes, trendsRes, statusRes, sourceRes] =
        await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRecentApplications(),
          dashboardApi.getUpcomingInterviews(),
          dashboardApi.getApplicationTrends(),
          dashboardApi.getStatusDistribution(),
          dashboardApi.getSourceDistribution(),
        ]);

      setSummaryData(summaryRes.data);
      setRecentApps(appsRes.data || []);
      setUpcomingInterviews(interviewsRes.data || []);
      setTrends(trendsRes.data || []);
      setStatusDist(statusRes.data || []);
      setSourceDist(sourceRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen for custom refresh events
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('careertrack:refresh-data', handleRefresh);
    return () => window.removeEventListener('careertrack:refresh-data', handleRefresh);
  }, []);

  if (loading && !summaryData) {
    return (
      <div className="py-4">
        <LoadingSkeleton rows={6} height={60} />
      </div>
    );
  }

  const s = summaryData?.summary || {
    total: 0,
    applied: 0,
    assessments: 0,
    interviews: 0,
    offers: 0,
    rejections: 0,
  };

  const metrics = summaryData?.metrics || { responseRate: 0, interviewRate: 0, offerRate: 0 };

  return (
    <div>
      {/* Top Banner & Quick Rates */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
            <h2 className="fw-bold mb-0 text-main fs-3 tracking-tight">Overview Dashboard</h2>
            <span
              className="badge rounded-pill px-3 py-1 fw-semibold"
              style={{
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
                fontSize: '0.8rem',
              }}
            >
              Total Jobs Applied: {s.total}
            </span>
            <span
              className="badge rounded-pill px-3 py-1 fw-semibold"
              style={{
                background: '#FDF5ED',
                color: '#7E3B10',
                border: '1px solid rgba(126, 59, 16, 0.25)',
                fontSize: '0.8rem',
              }}
            >
              Awaited Decision: {s.applied}
            </span>
          </div>
          <p className="text-secondary small mb-0">
            Real-time insights and progress metrics from your application pipeline
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/applications" className="btn btn-secondary-ct btn-sm">
            <span>View All Applications</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Core Stat Cards */}
      <div className="row g-3 mb-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-6">
        <div className="col">
          <StatCard
            title="Total Jobs Applied"
            value={s.total}
            icon={Briefcase}
            accentColor="#800020"
            accentBg="#FDF2F4"
          />
        </div>
        <div className="col">
          <StatCard
            title="Awaited Decision"
            value={s.applied}
            icon={Clock}
            accentColor="#7E3B10"
            accentBg="#FDF5ED"
          />
        </div>
        <div className="col">
          <StatCard
            title="Assessments"
            value={s.assessments}
            icon={FileCheck}
            accentColor="#B85D19"
            accentBg="#FDF5EE"
          />
        </div>
        <div className="col">
          <StatCard
            title="Shortlisted for Interviews"
            value={s.interviews}
            icon={CalendarCheck}
            accentColor="#780016"
            accentBg="#F8E7EA"
          />
        </div>
        <div className="col">
          <StatCard
            title="Offers Received"
            value={s.offers}
            icon={Sparkles}
            accentColor="#1F7A50"
            accentBg="#EDF7F2"
          />
        </div>
        <div className="col">
          <StatCard
            title="Rejected"
            value={s.rejections}
            icon={XCircle}
            accentColor="#A71D2A"
            accentBg="#FDF1F2"
          />
        </div>
      </div>

      {/* Conversion Funnel Bar */}
      <div className="ct-card mb-4 position-relative">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h6 className="fw-bold text-main mb-1">Recruitment Progression Pipeline</h6>
            <p className="text-secondary small mb-0">
              Response Rate: <span className="fw-bold text-primary">{metrics.responseRate}%</span> |
              Interview Rate: <span className="fw-bold" style={{ color: '#9E2A2B' }}>{metrics.interviewRate}%</span> |
              Offer Conversion: <span className="fw-bold text-success">{metrics.offerRate}%</span>
            </p>
          </div>
          <span className="badge bg-light text-secondary border small px-2 py-1">
            Active Cohort: {s.total - (s.wishlist || 0)} submissions
          </span>
        </div>

        {/* Progress Bar with Interactive Hover Tooltip */}
        <div
          className="position-relative"
          onMouseLeave={() => setHoveredSegment(null)}
        >
          {hoveredSegment && (
            <div
              className="position-absolute shadow-lg rounded-3 px-3 py-2 text-white"
              style={{
                bottom: '100%',
                left: `${hoveredSegment.percentagePosition}%`,
                transform: 'translateX(-50%)',
                marginBottom: 10,
                background: '#171A2B',
                fontSize: '0.8rem',
                zIndex: 100,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: hoveredSegment.color,
                    display: 'inline-block',
                  }}
                ></span>
                <span className="fw-bold">{hoveredSegment.label}</span>
                <span className="badge rounded-pill bg-light text-dark ms-1">
                  {hoveredSegment.count} ({hoveredSegment.percentage}%)
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                {hoveredSegment.description}
              </div>
              {/* Arrow */}
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #171A2B',
                }}
              />
            </div>
          )}

          <div
            className="progress"
            style={{
              height: 16,
              borderRadius: 8,
              cursor: 'pointer',
              background: '#F0F2F7',
              overflow: 'hidden',
            }}
          >
            {/* Applied */}
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${s.total > 0 ? (s.applied / s.total) * 100 : 0}%`,
                background: '#800020',
                transition: 'opacity 0.2s',
                opacity: hoveredSegment && hoveredSegment.key !== 'applied' ? 0.6 : 1,
              }}
              onMouseEnter={() =>
                setHoveredSegment({
                  key: 'applied',
                  label: 'Applied (Waiting Initial Review)',
                  count: s.applied,
                  percentage: s.total > 0 ? Math.round((s.applied / s.total) * 100) : 0,
                  percentagePosition: s.total > 0 ? ((s.applied / 2) / s.total) * 100 : 15,
                  color: '#800020',
                  description: 'Applications submitted, awaiting recruiter screening',
                })
              }
            ></div>

            {/* Assessments */}
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${s.total > 0 ? (s.assessments / s.total) * 100 : 0}%`,
                background: '#B85D19',
                transition: 'opacity 0.2s',
                opacity: hoveredSegment && hoveredSegment.key !== 'assessments' ? 0.6 : 1,
              }}
              onMouseEnter={() =>
                setHoveredSegment({
                  key: 'assessments',
                  label: 'Assessments Stage',
                  count: s.assessments,
                  percentage: s.total > 0 ? Math.round((s.assessments / s.total) * 100) : 0,
                  percentagePosition: s.total > 0 ? ((s.applied + s.assessments / 2) / s.total) * 100 : 35,
                  color: '#B85D19',
                  description: 'Online tests / HackerRank / take-home assignments',
                })
              }
            ></div>

            {/* Interviews */}
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${s.total > 0 ? (s.interviews / s.total) * 100 : 0}%`,
                background: '#9E2A2B',
                transition: 'opacity 0.2s',
                opacity: hoveredSegment && hoveredSegment.key !== 'interviews' ? 0.6 : 1,
              }}
              onMouseEnter={() =>
                setHoveredSegment({
                  key: 'interviews',
                  label: 'Interviews in Progress',
                  count: s.interviews,
                  percentage: s.total > 0 ? Math.round((s.interviews / s.total) * 100) : 0,
                  percentagePosition:
                    s.total > 0
                      ? ((s.applied + s.assessments + s.interviews / 2) / s.total) * 100
                      : 55,
                  color: '#9E2A2B',
                  description: 'Technical, system design, and behavioral interview rounds',
                })
              }
            ></div>

            {/* Offers */}
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${s.total > 0 ? (s.offers / s.total) * 100 : 0}%`,
                background: '#1F7A50',
                transition: 'opacity 0.2s',
                opacity: hoveredSegment && hoveredSegment.key !== 'offers' ? 0.6 : 1,
              }}
              onMouseEnter={() =>
                setHoveredSegment({
                  key: 'offers',
                  label: 'Offers Extended',
                  count: s.offers,
                  percentage: s.total > 0 ? Math.round((s.offers / s.total) * 100) : 0,
                  percentagePosition:
                    s.total > 0
                      ? ((s.applied + s.assessments + s.interviews + s.offers / 2) / s.total) * 100
                      : 75,
                  color: '#1F7A50',
                  description: 'Official employment offers received and in negotiation',
                })
              }
            ></div>

            {/* Rejections */}
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${s.total > 0 ? (s.rejections / s.total) * 100 : 0}%`,
                background: '#A71D2A',
                transition: 'opacity 0.2s',
                opacity: hoveredSegment && hoveredSegment.key !== 'rejections' ? 0.6 : 1,
              }}
              onMouseEnter={() =>
                setHoveredSegment({
                  key: 'rejections',
                  label: 'Rejected',
                  count: s.rejections,
                  percentage: s.total > 0 ? Math.round((s.rejections / s.total) * 100) : 0,
                  percentagePosition:
                    s.total > 0
                      ? Math.min(
                          90,
                          ((s.applied + s.assessments + s.interviews + s.offers + s.rejections / 2) /
                            s.total) *
                            100
                        )
                      : 90,
                  color: '#A71D2A',
                  description: 'Positions concluded or archived without offer',
                })
              }
            ></div>
          </div>
        </div>

        {/* Legend beneath the bar for quick reference */}
        <div className="d-flex flex-wrap gap-3 mt-2 pt-1" style={{ fontSize: '0.75rem' }}>
          <div className="d-flex align-items-center gap-1 text-secondary">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#800020' }}></span>
            <span>Applied ({s.applied})</span>
          </div>
          <div className="d-flex align-items-center gap-1 text-secondary">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B85D19' }}></span>
            <span>Assessments ({s.assessments})</span>
          </div>
          <div className="d-flex align-items-center gap-1 text-secondary">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9E2A2B' }}></span>
            <span>Interviews ({s.interviews})</span>
          </div>
          <div className="d-flex align-items-center gap-1 text-secondary">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1F7A50' }}></span>
            <span>Offers ({s.offers})</span>
          </div>
          <div className="d-flex align-items-center gap-1 text-secondary">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A71D2A' }}></span>
            <span>Rejected ({s.rejections})</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-4 mb-4">
        {/* Applications Over Time (Area Chart) */}
        <div className="col-12 col-xl-8">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-3">Applications & Outcomes Over Time</h6>
            <div style={{ width: '100%', height: 280 }}>
              {trends.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No historical trend data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#800020" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#800020" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#71758A' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#71758A' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E7E9F2',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Applications"
                      stroke="#800020"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorApps)"
                    />
                    <Area
                      type="monotone"
                      dataKey="offers"
                      name="Offers"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOffers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="col-12 col-xl-4">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-3">Applications by Status</h6>
            <div style={{ width: '100%', height: 280 }}>
              {statusDist.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No status data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {statusDist.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || '#635BFF'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E7E9F2',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications & Upcoming Interviews Row */}
      <div className="row g-4">
        {/* Recent Applications (Latest 5) */}
        <div className="col-12 col-lg-7">
          <div className="ct-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-main mb-0">Recent Applications</h6>
              <Link to="/applications" className="small text-primary fw-semibold text-decoration-none">
                View All
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <EmptyState
                title="No applications tracked yet"
                description="Click '+ Add Application' to record your first job application."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-secondary">
                    <tr>
                      <th className="border-0">Company & Role</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Next Interview</th>
                      <th className="border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div className="fw-semibold text-main small">{app.company}</div>
                          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            {app.jobTitle}
                          </div>
                        </td>
                        <td className="small text-secondary">
                          {new Date(app.applicationDate).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td>
                          {app.nextInterview ? (
                            <span className="badge bg-light text-primary border small">
                              {new Date(app.nextInterview.scheduledAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/applications/${app._id}`}
                            className="btn btn-sm btn-link text-primary p-0"
                            title="View Application Details"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="col-12 col-lg-5">
          <div className="ct-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-main mb-0">Upcoming Scheduled Interviews</h6>
              <Link to="/interviews" className="small text-primary fw-semibold text-decoration-none">
                Calendar View
              </Link>
            </div>

            {upcomingInterviews.length === 0 ? (
              <EmptyState
                title="No upcoming interviews"
                description="You have no interviews scheduled on your calendar."
              />
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="p-3 rounded-3 border d-flex flex-column gap-2"
                    style={{ background: 'var(--surface-alt)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span className="fw-bold text-main small d-block">
                          {interview.applicationId?.company || 'Company'}
                        </span>
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                          {interview.round}
                        </span>
                      </div>
                      <span className="badge bg-white text-secondary border small">
                        {interview.mode}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-3 text-secondary" style={{ fontSize: '0.78rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={13} className="text-primary" />
                        {new Date(interview.scheduledAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>({interview.durationMinutes} mins)</span>
                    </div>

                    {interview.meetingLink && (
                      <div className="mt-1">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary py-0 px-2 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <Video size={13} />
                          <span>Join Meeting</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
