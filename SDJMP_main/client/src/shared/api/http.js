import axios from 'axios'
import env from '@/shared/config/env'
import { normalizeApiError } from '@/shared/api/api-error'

let csrfToken = null

function getMetaCsrfToken() {
  if (typeof document === 'undefined') {
    return null
  }

  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null
}

export function setCsrfToken(token) {
  csrfToken = token || null
}

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: env.requestTimeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

http.interceptors.request.use((config) => {
  const token = csrfToken || getMetaCsrfToken()

  if (token) {
    config.headers['X-CSRF-Token'] = token
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    const responseCsrfToken = response.headers?.['x-csrf-token']

    if (responseCsrfToken) {
      setCsrfToken(responseCsrfToken)
    }

    return response
  },
  (error) => Promise.reject(normalizeApiError(error)),
)

export async function request(config) {
  const response = await http(config)
  return response.data
}
