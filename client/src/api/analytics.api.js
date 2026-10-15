import api from './axios.js';

export const analyticsApi = {
  getOverview: async (params = {}) => {
    const res = await api.get('/analytics/overview', { params });
    return res.data;
  },

  getApplicationTrends: async (params = {}) => {
    const res = await api.get('/analytics/application-trends', { params });
    return res.data;
  },

  getStatusDistribution: async (params = {}) => {
    const res = await api.get('/analytics/status-distribution', { params });
    return res.data;
  },

  getSourceEffectiveness: async () => {
    const res = await api.get('/analytics/source-effectiveness');
    return res.data;
  },

  getInterviewPerformance: async () => {
    const res = await api.get('/analytics/interview-performance');
    return res.data;
  },

  getMonthlyOutcomes: async () => {
    const res = await api.get('/analytics/monthly-outcomes');
    return res.data;
  },
};
