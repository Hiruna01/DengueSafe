import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clearSession, readOfficer, readToken, writeSession } from '../api/authToken'
import { getCurrentOfficer, login as loginRequest } from '../features/auth/api/authApi'

/*
  Replaces the old resident/officer toggle. That was a view switch with nothing
  behind it; this is the real thing — the API now refuses the officer endpoints
  without a token, so the frontend cannot grant access it does not have.

  A stored session is trusted for the first paint (so a reload does not flash
  the login page) and then confirmed against /auth/me. If that call fails —
  expired token, deactivated account, revoked signing key — the session is
  dropped.
*/
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [officer, setOfficer] = useState(readOfficer)

  // True until the stored session has been checked, so ProtectedRoute can wait
  // rather than bouncing a signed-in officer to /login on every refresh.
  const [restoring, setRestoring] = useState(() => Boolean(readToken()))

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setOfficer(null)
  }, [])

  useEffect(() => {
    if (!readToken()) {
      setRestoring(false)
      return undefined
    }

    let cancelled = false

    getCurrentOfficer()
      .then((current) => {
        if (cancelled) return
        // Refreshed rather than assumed: a role or MOH area may have changed
        // since the token was issued.
        setOfficer(current)
        writeSession(readToken(), current)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setRestoring(false)
      })

    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(async (email, password) => {
    const result = await loginRequest(email, password)

    writeSession(result.token, result.officer)
    setToken(result.token)
    setOfficer(result.officer)

    return result.officer
  }, [])

  const value = useMemo(
    () => ({
      token,
      officer,
      restoring,
      login,
      logout,
      isAuthenticated: Boolean(token && officer),
      isAdmin: officer?.role === 'Admin',
    }),
    [token, officer, restoring, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }

  return context
}
