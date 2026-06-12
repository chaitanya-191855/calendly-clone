import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? err.message ?? 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

// ── Event Types ────────────────────────────────────────────────────────────────
export const eventTypesApi = {
  list:   ()         => api.get('/api/event-types').then((r) => r.data),
  getById:(id: string) => api.get(`/api/event-types/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post('/api/event-types', data).then((r) => r.data),
  update: (id: string, data: unknown) => api.put(`/api/event-types/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/event-types/${id}`).then((r) => r.data),
}

// ── Availability ───────────────────────────────────────────────────────────────
export const availabilityApi = {
  get:    () => api.get('/api/availability').then((r) => r.data),
  update: (data: unknown) => api.put('/api/availability', data).then((r) => r.data),
}

// ── Booking (public) ───────────────────────────────────────────────────────────
export const bookingApi = {
  getEventType: (slug: string) => api.get(`/api/book/${slug}`).then((r) => r.data),
  getSlots:     (slug: string, date: string, tz?: string) =>
    api.get(`/api/book/${slug}/slots`, {
      params: { date, tz: tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone },
    }).then((r) => r.data),
  create:       (slug: string, data: unknown) =>
    api.post(`/api/book/${slug}`, data).then((r) => r.data),
  getConfirmation: (token: string) =>
    api.get(`/api/book/confirm/${token}`).then((r) => r.data),
  cancel: (token: string) =>
    api.delete(`/api/book/confirm/${token}`).then((r) => r.data),
}

// ── Meetings ───────────────────────────────────────────────────────────────────
export const meetingsApi = {
  list:   (filter: 'upcoming' | 'past') =>
    api.get('/api/meetings', { params: { filter } }).then((r) => r.data),
  cancel: (id: string) => api.delete(`/api/meetings/${id}`).then((r) => r.data),
}
