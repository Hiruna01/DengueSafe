import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, EmptyState, ErrorMessage, Spinner } from '../../../shared'
import { getDivisionRisk, orderByBand } from '../api/divisionsApi'
import DivisionRiskCard from '../components/DivisionRiskCard'

/*
  The full board: every division, scored and banded. Reached from the landing
  page and from the nav — deliberately readable by a resident, not just an
  officer.

  The API returns divisions worst-first by vector risk; `orderByBand` reorders
  them so an Emergency division leads regardless of which axis put it there.
*/
export default function RiskBoardPage() {
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')

    getDivisionRisk()
      .then(setDivisions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const ordered = useMemo(() => orderByBand(divisions), [divisions])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-medium tracking-tight text-ink">Dengue risk board</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Every division, scored on the breeding sites still open and the cases confirmed in the
            last 14 days. The ones needing action come first.
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 rounded border border-accent bg-accent px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:border-accent-hover hover:bg-accent-hover"
        >
          Report a breeding site
        </Link>
      </header>

      <ErrorMessage message={error} onRetry={load} />

      {loading ? (
        <Spinner label="Loading risk board" />
      ) : ordered.length === 0 ? (
        !error && (
          <Card>
            <EmptyState
              title="No divisions to show"
              description="Nothing has been set up for this area yet. Once divisions exist, their risk bands appear here."
            />
          </Card>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((division) => (
            <DivisionRiskCard key={division.id} division={division} />
          ))}
        </div>
      )}
    </div>
  )
}
