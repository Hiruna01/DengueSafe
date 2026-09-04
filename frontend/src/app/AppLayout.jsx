import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../shared'
import { useAuth } from './AuthContext'

const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/risk-board', label: 'Risk board' },
  { to: '/report', label: 'Report' },
  { to: '/my-reports', label: 'My reports' },
  { to: '/about', label: 'About' },
]

const OFFICER_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/risk-board', label: 'Risk board' },
  { to: '/queue', label: 'Queue' },
  { to: '/cases', label: 'Cases' },
  { to: '/dashboard', label: 'Dashboard' },
]

/** Account management, for admins only. */
const ADMIN_NAV = [{ to: '/officers', label: 'Officers' }]

export default function AppLayout() {
  const { officer, isAuthenticated, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const nav = isAuthenticated
    ? [...OFFICER_NAV, ...(isAdmin ? ADMIN_NAV : [])]
    : PUBLIC_NAV

  function signOut() {
    logout()
    navigate('/', { replace: true })
  }

  /*
    The landing page runs full-bleed: it sets its own section widths, bands and
    vertical rhythm, and carries its own footer. Every other route gets the
    standard measure.
  */
  const isFullBleed = pathname === '/' || pathname === '/login'

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
          <NavLink to="/" className="shrink-0 font-serif text-base text-ink">
            DengueWatch
          </NavLink>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-ink-muted hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated ? (
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-medium text-ink">{officer.fullName}</span>
                <span className="block text-xs text-ink-muted">
                  {officer.mohArea || officer.role}
                </span>
              </span>
              <Button variant="secondary" onClick={signOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="shrink-0 rounded border border-line-strong px-2.5 py-1.5 text-sm whitespace-nowrap text-ink transition-colors hover:border-ink-subtle"
            >
              Officer sign-in
            </NavLink>
          )}
        </div>
      </header>

      <main className={isFullBleed ? '' : 'mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10'}>
        <Outlet />
      </main>
    </div>
  )
}
