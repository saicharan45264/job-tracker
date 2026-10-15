import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../api/analytics.api.js';
import { StatCard } from '../components/common/StatCard.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';

const STATUS_COLORS = ['#635BFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export const Analytics = () => {
  const [dateRange, setDateRange] = useState('all'); // '30', '90', 'year', 'all'
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [sourceEffectiveness, setSourceEffectiveness] = useState([]);
  const [interviewPerf, setInterviewPerf] = useState({ byType: [], byOutcome: [] });
  const [monthlyOutcomes, setMonthlyOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDateFilter = () => {
    const now = new Date();
    if (dateRange === '30') {
      const start = new Date(now.getTime() - 30 * 86400000);
      return { startDate: start.toISOString() };
    } else if (dateRange === '90') {
      const start = new Date(now.getTime() - 90 * 86400000);
      return { startDate: start.toISOString() };
    } else if (dateRange === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: start.toISOString() };
    }
    return {};
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const filter = getDateFilter();
      const [ovRes, trRes, stRes, scRes, inRes, moRes] = await Promise.all([
        analyticsApi.getOverview(filter),
        analyticsApi.getApplicationTrends(filter),
        analyticsApi.getStatusDistribution(filter),
        analyticsApi.getSourceEffectiveness(),
        analyticsApi.getInterviewPerformance(),
        analyticsApi.getMonthlyOutcomes(),
      ]);

      setOverview(ovRes.data);
      setTrends(trRes.data || []);
      setStatusDist(stRes.data || []);
      setSourceEffectiveness(scRes.data || []);
      setInterviewPerf(inRes.data || { byType: [], byOutcome: [] });
      setMonthlyOutcomes(moRes.data || []);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !overview) {
    return (
      <div className="py-4">
        <LoadingSkeleton rows={6} height={60} />
      </div>
    );
  }

  return (
    <div>
      {/* Header and Date Filter */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-main fs-3 tracking-tight">Performance Analytics</h2>
          <p className="text-secondary small mb-0">
            Comprehensive breakdown of application conversion cohorts and interview outcomes
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small fw-semibold">Period:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 150 }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="30">Past 30 Days</option>
            <option value="90">Past 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Total Tracked"
            value={overview?.totalApplications ?? 0}
            icon={TrendingUp}
            accentColor="#635BFF"
            accentBg="#F0EFFF"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Awaiting Decision"
            value={overview?.awaitingDecision ?? 0}
            icon={Calendar}
            accentColor="#3B82F6"
            accentBg="#EFF6FF"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Interview Rate"
            value={`${overview?.interviewRate ?? 0}%`}
            icon={Percent}
            accentColor="#9333EA"
            accentBg="#FAF5FF"
            subtitle="Reached interview"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Offer Rate"
            value={`${overview?.offerRate ?? 0}%`}
            icon={Sparkles}
            accentColor="#16A36A"
            accentBg="#EAF8F1"
            subtitle="Cohort conversion"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Scheduled Interviews"
            value={overview?.interviewsScheduled ?? 0}
            icon={CheckCircle2}
            accentColor="#F59E0B"
            accentBg="#FFFBEB"
          />
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <StatCard
            title="Time to Interview"
            value={`${overview?.avgDaysToInterview ?? 0}d`}
            icon={Clock}
            accentColor="#0284C7"
            accentBg="#EDF7FD"
            subtitle="Avg days from apply"
          />
        </div>
      </div>

      {/* Charts Row 1: Trends & Status Distribution */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-3">Application Pipeline Trends</h6>
            <div style={{ width: '100%', height: 290 }}>
              {trends.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No data in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#635BFF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#635BFF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="anInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71758A' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#71758A' }} allowDecimals={false} />
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
                      dataKey="applications"
                      name="Applications"
                      stroke="#635BFF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#anApps)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interviews"
                      name="Interviews"
                      stroke="#A855F7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#anInterviews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-3">Status Breakdown</h6>
            <div style={{ width: '100%', height: 290 }}>
              {statusDist.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No status data
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
                      outerRadius={85}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDist.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
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
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Source Effectiveness & Monthly Outcomes */}
      <div className="row g-4">
        {/* Source Effectiveness Bar Chart */}
        <div className="col-12 col-lg-6">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-1">Source Effectiveness & Yield</h6>
            <p className="text-secondary small mb-3">
              Total applications vs resulting interviews by source
            </p>
            <div style={{ width: '100%', height: 280 }}>
              {sourceEffectiveness.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No source data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceEffectiveness}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" />
                    <XAxis
                      dataKey="source"
                      tick={{ fontSize: 11, fill: '#71758A' }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#71758A' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E7E9F2',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                    <Bar dataKey="total" name="Total Submissions" fill="#635BFF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interviews" name="Interviews Yielded" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Offers vs Rejections */}
        <div className="col-12 col-lg-6">
          <div className="ct-card h-100">
            <h6 className="fw-bold text-main mb-1">Decision Outcomes by Month</h6>
            <p className="text-secondary small mb-3">
              Monthly comparison of accepted offers vs rejections
            </p>
            <div style={{ width: '100%', height: 280 }}>
              {monthlyOutcomes.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  No final decision records in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyOutcomes}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71758A' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#71758A' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E7E9F2',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                    <Bar dataKey="offers" name="Offers" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejections" name="Rejections" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
