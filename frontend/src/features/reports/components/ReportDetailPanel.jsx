import { useState } from 'react'
import {
  Button,
  ErrorMessage,
  Select,
  StatusBadge,
  Textarea,
  formatDate,
  statusLabel,
} from '../../../shared'
import { UPDATABLE_STATUSES, siteTypeLabel, updateStatus } from '../api/reportsApi'

function Detail({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-ink">{children}</dd>
    </div>
  )
}

/*
  The expanded row: everything the queue table has no room for, plus the one
  write an officer performs. Mounted fresh per report (keyed by id in the list),
  so the note box never carries text over from the row before.
*/
export default function ReportDetailPanel({ report, onUpdated }) {
  const [status, setStatus] = useState('')
  const [note, setNote] = useState(report.inspectorNote ?? '')
  const [statusError, setStatusError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!status) {
      setStatusError('Choose the status to move this report to.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await updateStatus(report.id, status, note.trim())
      onUpdated?.()
    } catch (err) {
      setError(err.message)
      setStatusError(err.fieldErrors?.status ?? '')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-line bg-canvas px-4 py-4 sm:px-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Detail label="What was reported">{report.description}</Detail>
        </div>
        <Detail label="Reported by">{report.reporterName}</Detail>
        <Detail label="Landmark">{report.landmark || '—'}</Detail>
        <Detail label="Site type">{siteTypeLabel(report.siteType)}</Detail>
        <Detail label="Division">{report.divisionName}</Detail>
        <Detail label="Reported on">{formatDate(report.reportedAt)}</Detail>
        <Detail label="Inspected on">{formatDate(report.inspectedAt)}</Detail>
        <div className="sm:col-span-2">
          <Detail label="Current status">
            <StatusBadge status={report.status} />
          </Detail>
        </div>
        {report.inspectorNote && (
          <div className="sm:col-span-2">
            <Detail label="Last note">{report.inspectorNote}</Detail>
          </div>
        )}
      </dl>

      <ErrorMessage message={error} />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 border-t border-line pt-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id={`status-${report.id}`}
            label="Move to"
            placeholder="Choose a status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setStatusError('')
            }}
            error={statusError}
            disabled={saving}
            options={UPDATABLE_STATUSES.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <Textarea
            id={`note-${report.id}`}
            label="Inspector note"
            rows={3}
            maxLength={500}
            placeholder="Optional — what you found, or what the occupier was told."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <Button type="submit" variant="primary" loading={saving}>
            Update report
          </Button>
        </div>
      </form>
    </div>
  )
}
