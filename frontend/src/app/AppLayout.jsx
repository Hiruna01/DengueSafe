import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/items', label: 'Items' },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:gap-8 sm:px-6">
          <NavLink to="/" className="shrink-0 text-sm font-medium tracking-tight text-ink">
            Hackathon
          </NavLink>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => (
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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
