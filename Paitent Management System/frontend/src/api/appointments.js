import { laravelClient } from './client';

export const appointmentsApi = {
  async list(params) {
    const res = await laravelClient.get('/appointments', { params });
    if (Array.isArray(res.data)) return { data: res.data, meta: null };
    return { data: res.data.data || [], meta: res.data.meta || null };
  },
  async create(payload) {
    const res = await laravelClient.post('/appointments', payload);
    return res.data?.data ?? res.data;
  },
  async update(id, payload) {
    const res = await laravelClient.put(`/appointments/${id}`, payload);
    return res.data?.data ?? res.data;
  },
  async remove(id) {
    const res = await laravelClient.delete(`/appointments/${id}`);
    return res.data;
  },
};
