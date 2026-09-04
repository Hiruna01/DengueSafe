import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../shared'
import { useAuth } from './AuthContext'

/**
 * Gate for the officer routes. `adminOnly` narrows it further, for officer
 * management.
 *
 * This is a convenience, not the security boundary — the API enforces the same
 * rules and would refuse a hand-crafted request regardless of what the frontend
 * renders.
 */
export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin, restoring } = useAuth()
  const location = useLocation()

  // A stored session is still being confirmed; bouncing now would sign out
  // every officer who pressed refresh.
  if (restoring) {
    return <Spinner label="Checking your session" />
  }

  if (!isAuthenticated) {
    // Where they were heading, so login can send them on rather than dumping
    // them at a default page.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/queue" replace />
  }

  return <Outlet />
}
