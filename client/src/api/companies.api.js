import api from './axios.js';

export const companiesApi = {
  getCompanies: async (params = {}) => {
    const res = await api.get('/companies', { params });
    return res.data;
  },

  getCompanyById: async (id) => {
    const res = await api.get(`/companies/${id}`);
    return res.data;
  },

  createCompany: async (data) => {
    const res = await api.post('/companies', data);
    return res.data;
  },

  updateCompany: async (id, data) => {
    const res = await api.put(`/companies/${id}`, data);
    return res.data;
  },

  deleteCompany: async (id) => {
    const res = await api.delete(`/companies/${id}`);
    return res.data;
  },

  getCompanyApplications: async (id) => {
    const res = await api.get(`/companies/${id}/applications`);
    return res.data;
  },
};
