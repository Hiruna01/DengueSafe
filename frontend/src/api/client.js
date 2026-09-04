import axios from 'axios'
import { clearSession, readToken } from './authToken'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

/**
 * ASP.NET Core returns validation failures as RFC 7807 ProblemDetails:
 *   { title, status, errors: { Title: ["Title is required."], ... } }
 * Flatten that into { title: "Title is required." } keyed by camelCase field
 * so a form can look errors up by input name.
 */
function readFieldErrors(data) {
  if (!data || typeof data.errors !== 'object' || data.errors === null) return {}

  return Object.entries(data.errors).reduce((acc, [field, messages]) => {
    if (!field) return acc
    const key = field.charAt(0).toLowerCase() + field.slice(1)
    acc[key] = Array.isArray(messages) ? messages.join(' ') : String(messages)
    return acc
  }, {})
}

function readMessage(error) {
  const { response } = error
  if (!response) {
    return error.code === 'ECONNABORTED'
      ? 'The request timed out. Is the API still running?'
      : 'Cannot reach the API. Check that the backend is running.'
  }

  const { status, data } = response

  // The backend's ExceptionHandlingMiddleware shape: { message, detail }.
  if (data && typeof data.message === 'string') return data.message
  if (data && typeof data.title === 'string') return data.title
  if (typeof data === 'string' && data.trim()) return data

  if (status === 401) return 'Your session has expired. Sign in again.'
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 404) return 'Not found.'
  if (status === 400) return 'Some fields need attention.'
  return `Request failed (${status}).`
}

/*
  Every request carries the token if there is one. Anonymous endpoints — the
  risk board, submitting a report, the phone lookup — simply ignore it.
*/
client.interceptors.request.use((config) => {
  const token = readToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/*
  A 401 means the token is missing, expired or no longer accepted. There is
  nothing to retry, so the session is dropped and the officer is sent to sign in
  again — with one exception: a 401 raised by the login page itself would send
  it in a circle.
*/
function handleUnauthorized() {
  clearSession()

  if (window.location.pathname !== '/login') {
    // A full navigation rather than a router push: the interceptor sits
    // outside React, and this also clears any state left from the old session.
    window.location.assign('/login')
  }
}

// Unwrap the body so callers get the payload, not the axios envelope.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized()
    }

    return Promise.reject({
      message: readMessage(error),
      fieldErrors: readFieldErrors(error.response?.data),
      status: error.response?.status ?? 0,
    })
  },
)

export default client
