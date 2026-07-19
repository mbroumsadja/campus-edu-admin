// src/lib/api.ts
// Client Axios centralisé avec :
//   - Injection automatique du token JWT
//   - Refresh automatique du token expiré (intercepteur)
//   - Gestion des erreurs globale

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// ── Instance principale ────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Helpers tokens — double stockage Cookie + localStorage ─────────
// On utilise les deux pour fiabilité maximale (SSR + CSR)
export const setTokens = (accessToken: string, refreshToken: string) => {
  // Cookies (lus par le middleware Next.js)
  Cookies.set('accessToken',  accessToken,  { expires: 1, sameSite: 'lax', path: '/' })
  Cookies.set('refreshToken', refreshToken, { expires: 7, sameSite: 'lax', path: '/' })
  // localStorage (lu par Axios côté client)
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export const clearTokens = () => {
  Cookies.remove('accessToken',  { path: '/' })
  Cookies.remove('refreshToken', { path: '/' })
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export const getAccessToken = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') ?? Cookies.get('accessToken')
  }
  return Cookies.get('accessToken')
}

export const getRefreshToken = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken') ?? Cookies.get('refreshToken')
  }
  return Cookies.get('refreshToken')
}

// ── Intercepteur requête : injecter le token ───────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Intercepteur réponse : gérer le refresh automatique ───────────
let isRefreshing    = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token!))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (originalRequest.url?.includes('/auth/refresh')){
      clearTokens()
      if(typeof window !== 'undefined') window.location.href = '/auth/login'
      return Promise.reject(error)
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = data.data
        setTokens(accessToken, newRefresh)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Services API ───────────────────────────────────────────────────

export const authService = {
  login: (matricule: string, password: string) =>
    api.post('/auth/login', { matricule, password }),
  logout: () => api.post('/auth/logout'),
  me:     () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
}

export const coursService = {
  list:       (params?: Record<string, unknown>) => api.get('/cours', { params }),
  get:        (id: number) => api.get(`/cours/${id}`),
  create:     (data: FormData) => api.post('/cours', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changerStatut: (id: number, statut: string) =>
    api.patch(`/cours/${id}/statut`, { statut }),
  supprimer:  (id: number) => api.delete(`/cours/${id}`),
  telechargerUrl: (id: number) => `${BASE_URL}/cours/${id}/telecharger`,
}

export const sujetsService = {
  list:       (params?: Record<string, unknown>) => api.get('/sujets', { params }),
  get:        (id: number) => api.get(`/sujets/${id}`),
  create:     (data: FormData) => api.post('/sujets', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changerStatut: (id: number, statut: string) =>
    api.patch(`/sujets/${id}/statut`, { statut }),
  telechargerUrl: (id: number, corrige = false) =>
    `${BASE_URL}/sujets/${id}/telecharger${corrige ? '?corrige=true' : ''}`,
}

export const filieresService = {
  list:     () => api.get('/filieres'),
  get:      (id: number) => api.get(`/filieres/${id}`),
  ues:      (id: number, niveau?: string) =>
    api.get(`/filieres/${id}/ues`, { params: niveau ? { niveau } : {} }),
  create:   (data: unknown) => api.post('/filieres', data),
  creerUE:  (filiereId: number, data: unknown) =>
    api.post(`/filieres/${filiereId}/ues`, data),
}

export const usersService = {
  list:    (params?: Record<string, unknown>) => api.get('/users', { params }),
  get:     (id: number) => api.get(`/users/${id}`),
  create:  (data: unknown) => api.post('/users', data),
  update:  (id: number, data: unknown) => api.put(`/users/${id}`, data),
  changerStatut: (id: number, statut: string) =>
    api.patch(`/users/${id}/statut`, { statut }),
  supprimer: (id: number) => api.delete(`/users/${id}`),
}
