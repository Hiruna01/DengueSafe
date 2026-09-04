/*
  Where the session lives on disk, and the only module both the axios client and
  the React context import. Keeping it here rather than in AuthContext means the
  interceptors can read the token without importing React state, and the two
  cannot disagree about the storage key.
*/
const TOKEN_KEY = 'dengue.auth.token'
const OFFICER_KEY = 'dengue.auth.officer'

export function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function readOfficer() {
  try {
    const raw = localStorage.getItem(OFFICER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSession(token, officer) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(OFFICER_KEY, JSON.stringify(officer))
  } catch {
    // Storage disabled: the session simply won't survive a reload.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(OFFICER_KEY)
  } catch {
    // Nothing stored, nothing to clear.
  }
}
