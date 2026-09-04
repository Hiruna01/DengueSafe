import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  Input,
  Pagination,
  Select,
  Spinner,
  formatDate,
} from '../../../shared'
import { getDivisionRisk } from '../../divisions/api/divisionsApi'
import {
  AGE_BANDS,
  AGE_BAND_LABELS,
  SEVERITIES,
  SEVERITY_LABELS,
  ageBandLabel,
  createCase,
  getCases,
  severityLabel,
} from '../api/casesApi'

const PAGE_SIZE = 10

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY = {
  divisionId: '',
  reportedDate: today(),
  ageBand: '',
  severity: '',
  hospitalised: false,
}

/*
  Checked here so an officer is told before a round trip. The date rule mirrors
  the backend's NotInTheFuture attribute; everything else is a required field.
*/
function validate(form) {
  const errors = {}

  if (!form.divisionId) errors.divisionId = 'Choose the division the case was notified in.'

  if (!form.reportedDate) {
    errors.reportedDate = 'Enter the date the case was notified.'
  } else if (form.reportedDate > today()) {
    errors.reportedDate = 'The notification date cannot be in the future.'
  }

  if (!form.ageBand) errors.ageBand = 'Choose an age band.'
  if (!form.severity) errors.severity = 'Choose a severity.'

  return errors
}

/*
  Case notification. Recording a case also opens a premises-inspection report in
  the same division on the backend, mirroring the MOH case-investigation
  process — said plainly on screen so the extra queue item isn't a surprise.
*/
export default function RecordCasePage() {
  const [params, setParams] = useSearchParams()

  const divisionId = params.get('divisionId') ?? ''
  const page = Number(params.get('page') ?? 1)

  const [result, setResult] = useState(null)
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(null)

  const query = useMemo(() => ({ divisionId, page, pageSize: PAGE_SIZE }), [divisionId, page])

  const load = useCallback(() => {
    setLoading(true)
    setError('')

    getCases(query)
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

  function setFilter(value) {
    const next = new URLSearchParams(params)
    if (value) next.set('divisionId', value)
    else next.delete('divisionId')
    next.delete('page')
    setParams(next)
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validate(form)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      setFormError('')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const created = await createCase({
        divisionId: Number(form.divisionId),
        // Midnight UTC: the column is timestamptz and Npgsql rejects anything
        // that is not already UTC.
        reportedDate: new Date(`${form.reportedDate}T00:00:00Z`).toISOString(),
        ageBand: form.ageBand,
        severity: form.severity,
        hospitalised: form.hospitalised,
      })

      const division = divisions.find((d) => String(d.id) === String(form.divisionId))

      setConfirmed({
        ...created,
        divisionId: created.divisionId ?? Number(form.divisionId),
        divisionName: created.divisionName || division?.name || 'the division',
      })
      setForm({ ...EMPTY, reportedDate: today() })
      load()
    } catch (err) {
      setFormError(err.message)
      setErrors(err.fieldErrors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const cases = result?.items ?? []

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium tracking-tight text-ink">Case notifications</h1>
        <p className="mt-1 text-sm text-ink-muted">
          No patient names or addresses are held — only division, age band and severity.
        </p>
      </header>

      {confirmed && (
        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Case recorded</Badge>
              <p className="text-sm text-ink">
                Notified in <span className="font-medium">{confirmed.divisionName}</span> on{' '}
                {formatDate(confirmed.reportedDate)}.
              </p>
            </div>

            <p className="text-sm text-ink-muted">
              A premises inspection has been opened automatically for{' '}
              {confirmed.divisionName}, matching the MOH case-investigation process. It is already
              in the inspection queue — it does not count towards the division's vector risk,
              because that measure tracks reported breeding sites rather than the cases they cause.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/queue?divisionId=${confirmed.divisionId}`}
                className="inline-flex items-center justify-center rounded border border-accent bg-accent px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:border-accent-hover hover:bg-accent-hover"
              >
                View the inspection
              </Link>
              <Button variant="ghost" onClick={() => setConfirmed(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      )}

      <ErrorMessage message={formError} />

      <Card
        title="Notify a case"
        description="Recording a case also opens a premises inspection in that division."
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="caseDivision"
              label="Division"
              required
              placeholder="Choose a division"
              value={form.divisionId}
              onChange={update('divisionId')}
              error={errors.divisionId}
              disabled={saving}
              options={divisions.map((d) => ({ value: d.id, label: `${d.name} — ${d.district}` }))}
            />
            <Input
              id="reportedDate"
              label="Date notified"
              type="date"
              required
              max={today()}
              hint="Cannot be a future date."
              value={form.reportedDate}
              onChange={update('reportedDate')}
              error={errors.reportedDate}
              disabled={saving}
            />
            <Select
              id="ageBand"
              label="Age band"
              required
              placeholder="Choose an age band"
              value={form.ageBand}
              onChange={update('ageBand')}
              error={errors.ageBand}
              disabled={saving}
              options={AGE_BANDS.map((value) => ({ value, label: AGE_BAND_LABELS[value] }))}
            />
            <Select
              id="severity"
              label="Severity"
              required
              placeholder="Choose a severity"
              value={form.severity}
              onChange={update('severity')}
              error={errors.severity}
              disabled={saving}
              options={SEVERITIES.map((value) => ({ value, label: SEVERITY_LABELS[value] }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.hospitalised}
              onChange={update('hospitalised')}
              disabled={saving}
              className="h-4 w-4 rounded border-line-strong accent-accent"
            />
            Hospitalised
          </label>

          <div className="pt-1">
            <Button type="submit" variant="primary" loading={saving}>
              Notify case
            </Button>
          </div>
        </form>
      </Card>

      <ErrorMessage message={error} onRetry={load} />

      <Card
        title="Recent cases"
        actions={
          <Select
            id="caseDivisionFilter"
            placeholder="All divisions"
            value={divisionId}
            onChange={(event) => setFilter(event.target.value)}
            options={divisions.map((d) => ({ value: d.id, label: d.name }))}
          />
        }
        className="[&>div]:p-0"
      >
        {loading ? (
          <Spinner label="Loading cases" />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No cases recorded"
            description="Notified cases appear here, newest first."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Notified</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Division</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Age band</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Severity</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Hospitalised</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-ink">
                        {formatDate(item.reportedDate)}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{item.divisionName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                        {ageBandLabel(item.ageBand)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={item.severity === 'DHF' ? 'danger' : 'neutral'}>
                          {severityLabel(item.severity)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {item.hospitalised ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              totalCount={result.totalCount}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  )
}
