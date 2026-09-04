import { useCallback, useEffect, useState } from 'react'
import { Card, ErrorMessage, Spinner } from '../../../shared'
import { getDashboard } from '../api/divisionsApi'
import DivisionRiskTable from '../components/DivisionRiskTable'
import QuadrantMatrix from '../components/QuadrantMatrix'

function Stat({ label, value, hint }) {
  return (
    <div className="rounded border border-line bg-surface px-4 py-3.5">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-xl tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p>}
    </div>
  )
}

/** One site type's share of open reports, as a proportional bar. */
function SiteTypeBar({ site, max }) {
  const width = max > 0 ? Math.max((site.count / max) * 100, 4) : 0

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-ink">{site.label}</span>
        <span className="shrink-0 text-sm tabular-nums text-ink-muted">{site.count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-accent-soft">
        <div className="h-full rounded bg-accent" style={{ width: `${width}%` }} />
      </div>
    </li>
  )
}

/** Officer overview: the totals, where every division sits, and what is driving it. */
export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')

    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const maxSiteTypeCount = data?.topSiteTypes.reduce((max, site) => Math.max(max, site.count), 0) ?? 0

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Programme-wide position across all divisions.
        </p>
      </header>

      <ErrorMessage message={error} onRetry={load} />

      {loading ? (
        <Spinner label="Loading dashboard" />
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Open reports" value={data.totalOpenReports} hint="Awaiting clearance" />
            <Stat label="Cases" value={data.totalRecentCases} hint="Last 14 days" />
            <Stat
              label="Average days to clear"
              value={data.averageDaysToClear.toFixed(1)}
              hint="Report raised to inspected"
            />
          </div>

          <Card
            title="The risk matrix"
            description="Breeding sites reported against cases confirmed. Where a division sits decides what it is told to do."
          >
            <QuadrantMatrix divisions={data.divisions} />
          </Card>

          <Card
            title="Most common site types"
            description="Across open reports — what inspectors are actually finding."
          >
            {data.topSiteTypes.length === 0 ? (
              <p className="text-sm text-ink-muted">No open reports.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.topSiteTypes.map((site) => (
                  <SiteTypeBar key={site.siteType} site={site} max={maxSiteTypeCount} />
                ))}
              </ul>
            )}
          </Card>

          <Card title="Divisions" description="Highest vector risk first.">
            <DivisionRiskTable divisions={data.divisions} />
          </Card>
        </>
      ) : null}
    </div>
  )
}
