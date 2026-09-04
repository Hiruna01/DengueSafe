import axios from 'axios'

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

  if (status === 404) return 'Not found.'
  if (status === 400) return 'Some fields need attention.'
  return `Request failed (${status}).`
}

// Unwrap the body so callers get the payload, not the axios envelope.
client.interceptors.response.use(
  (response) => response.data,
  (error) =>
    Promise.reject({
      message: readMessage(error),
      fieldErrors: readFieldErrors(error.response?.data),
      status: error.response?.status ?? 0,
    }),
)

export default client
