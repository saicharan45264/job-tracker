import api from './axios.js';

export const interviewsApi = {
  getInterviews: async (params = {}) => {
    const res = await api.get('/interviews', { params });
    return res.data;
  },

  getInterviewById: async (id) => {
    const res = await api.get(`/interviews/${id}`);
    return res.data;
  },

  createInterview: async (data) => {
    const res = await api.post('/interviews', data);
    return res.data;
  },

  updateInterview: async (id, data) => {
    const res = await api.put(`/interviews/${id}`, data);
    return res.data;
  },

  updateOutcome: async (id, outcome, feedback = '') => {
    const res = await api.patch(`/interviews/${id}/outcome`, { outcome, feedback });
    return res.data;
  },

  deleteInterview: async (id) => {
    const res = await api.delete(`/interviews/${id}`);
    return res.data;
  },

  getUpcoming: async () => {
    const res = await api.get('/interviews/upcoming');
    return res.data;
  },

  getCalendar: async (params = {}) => {
    const res = await api.get('/interviews/calendar', { params });
    return res.data;
  },
};
