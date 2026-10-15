import api from './axios.js';

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  getRecentApplications: async () => {
    const res = await api.get('/dashboard/recent-applications');
    return res.data;
  },

  getUpcomingInterviews: async () => {
    const res = await api.get('/dashboard/upcoming-interviews');
    return res.data;
  },

  getApplicationTrends: async () => {
    const res = await api.get('/dashboard/application-trends');
    return res.data;
  },

  getStatusDistribution: async () => {
    const res = await api.get('/dashboard/status-distribution');
    return res.data;
  },

  getSourceDistribution: async () => {
    const res = await api.get('/dashboard/source-distribution');
    return res.data;
  },
};
