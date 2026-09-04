import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  EmptyState,
  ErrorMessage,
  Input,
  Pagination,
  REPORT_STATUSES,
  Select,
  Spinner,
  statusLabel,
  useDebounced,
} from '../../../shared'
import { useSearchParams } from 'react-router-dom'
import { getDivisionRisk } from '../../divisions/api/divisionsApi'
import {
  AGEING_THRESHOLD_DAYS,
  SITE_TYPES,
  SITE_TYPE_LABELS,
  getReports,
} from '../api/reportsApi'
import InspectionQueueList from '../components/InspectionQueueList'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

/*
  The prioritised queue. Ordering is the backend's — reports come back scored
  and sorted by risk, so an officer works from the top down rather than from the
  most recent.

  Filters live in the URL rather than in component state, so a queue view can be
  refreshed or shared and still show the same thing.
*/
export default function InspectionQueuePage() {
  const [params, setParams] = useSearchParams()

  const divisionId = params.get('divisionId') ?? ''
  const siteType = params.get('siteType') ?? ''
  const status = params.get('status') ?? ''
  const page = Number(params.get('page') ?? 1)

  const [searchInput, setSearchInput] = useState(params.get('search') ?? '')
  const search = useDebounced(searchInput, SEARCH_DEBOUNCE_MS)

  const [result, setResult] = useState(null)
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const query = useMemo(
    () => ({ divisionId, siteType, status, search, page, pageSize: PAGE_SIZE }),
    [divisionId, siteType, status, search, page],
  )

  const load = useCallback(() => {
    setLoading(true)
    setError('')

    getReports(query)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(load, [load])

  useEffect(() => {
    getDivisionRisk()
      .then(setDivisions)
      .catch(() => setDivisions([]))
  }, [])

  // Search is debounced, so reset paging when the settled term changes.
  useEffect(() => {
    const current = params.get('search') ?? ''
    if (current === search) return

    const next = new URLSearchParams(params)
    if (search) next.set('search', search)
    else next.delete('search')
    next.delete('page')
    setParams(next, { replace: true })
  }, [search, params, setParams])

  /** Writes one filter and resets to page 1, since the result set changed. */
  function setFilter(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
    setExpandedId(null)
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
    setExpandedId(null)
  }

  /*
    A status change moves the report's risk score, and the queue is ordered by
    it — so the whole page is refetched rather than patched in place, and the
    row settles into its new position.
  */
  function handleUpdated() {
    setExpandedId(null)
    load()
  }

  const reports = result?.items ?? []
  const ageingCount = reports.filter((report) => report.daysOpen > AGEING_THRESHOLD_DAYS).length

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium tracking-tight text-ink">Inspection queue</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ordered by risk score, not by date — work from the top down. Anything open more than{' '}
          {AGEING_THRESHOLD_DAYS} days is flagged: it has had time to breed a new generation.
        </p>
      </header>

      <ErrorMessage message={error} onRetry={load} />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            id="search"
            label="Search"
            placeholder="Description or landmark"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Select
            id="divisionFilter"
            label="Division"
            placeholder="All divisions"
            value={divisionId}
            onChange={(event) => setFilter('divisionId', event.target.value)}
            options={divisions.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            id="siteTypeFilter"
            label="Site type"
            placeholder="All site types"
            value={siteType}
            onChange={(event) => setFilter('siteType', event.target.value)}
            options={SITE_TYPES.map((value) => ({ value, label: SITE_TYPE_LABELS[value] }))}
          />
          <Select
            id="statusFilter"
            label="Status"
            placeholder="All statuses"
            value={status}
            onChange={(event) => setFilter('status', event.target.value)}
            options={REPORT_STATUSES.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading queue" />
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            title="No reports match"
            description="Try clearing a filter or widening the search."
          />
        </Card>
      ) : (
        <section className="rounded border border-line bg-surface">
          {ageingCount > 0 && (
            <p className="border-b border-line px-4 py-2.5 text-xs text-ink-muted sm:px-5">
              {ageingCount} of {reports.length} on this page{' '}
              {ageingCount === 1 ? 'has' : 'have'} been open more than {AGEING_THRESHOLD_DAYS} days.
            </p>
          )}

          <InspectionQueueList
            reports={reports}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
            onUpdated={handleUpdated}
          />

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            totalCount={result.totalCount}
            totalPages={result.totalPages}
            onPageChange={setPage}
          />
        </section>
      )}
    </div>
  )
}
