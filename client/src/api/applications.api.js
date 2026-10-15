import api from './axios.js';

export const applicationsApi = {
  getApplications: async (params = {}) => {
    const res = await api.get('/applications', { params });
    return res.data;
  },

  getApplicationById: async (id) => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  createApplication: async (data) => {
    const res = await api.post('/applications', data);
    return res.data;
  },

  updateApplication: async (id, data) => {
    const res = await api.put(`/applications/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status, notes = '') => {
    const res = await api.patch(`/applications/${id}/status`, { status, notes });
    return res.data;
  },

  deleteApplication: async (id) => {
    const res = await api.delete(`/applications/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/applications/stats');
    return res.data;
  },

  exportCsv: async (params = {}) => {
    const res = await api.get('/applications/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  getActivities: async (id) => {
    const res = await api.get(`/applications/${id}/activities`);
    return res.data;
  },
};
