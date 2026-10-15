import api, { setAccessToken } from './axios.js';

export const authApi = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  refreshToken: async () => {
    const res = await api.post('/auth/refresh');
    if (res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateMe: async (data) => {
    const res = await api.patch('/auth/me', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.patch('/auth/change-password', data);
    return res.data;
  },
};
