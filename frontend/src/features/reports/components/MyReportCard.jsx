import { StatusBadge, formatDate } from '../../../shared'
import { siteTypeLabel } from '../api/reportsApi'

/*
  One of a resident's own reports. The officer queue uses a table; this stays a
  card so it reads down a 375px screen without sideways scrolling.

  `daysOpen` comes from the backend and is 0 once a report is cleared or has
  reached notice stage — the frontend never decides for itself which statuses
  still count as open.
*/
export default function MyReportCard({ report }) {
  return (
    <article className="flex flex-col gap-3 rounded border border-line bg-surface px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-ink">{siteTypeLabel(report.siteType)}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            {report.divisionName} · DW-{report.id}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <p className="text-sm text-ink-muted">{report.description}</p>
      {report.landmark && <p className="-mt-2 text-xs text-ink-subtle">{report.landmark}</p>}

      <dl className="flex gap-6 border-t border-line pt-2.5">
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">Reported</dt>
          <dd className="mt-0.5 text-sm text-ink">{formatDate(report.reportedAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">Days open</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-ink">{report.daysOpen}</dd>
        </div>
        {report.inspectedAt && (
          <div className="min-w-0">
            <dt className="text-xs text-ink-muted">Inspected</dt>
            <dd className="mt-0.5 text-sm text-ink">{formatDate(report.inspectedAt)}</dd>
          </div>
        )}
      </dl>

      {report.inspectorNote && (
        <p className="rounded border border-line bg-canvas px-3 py-2 text-xs text-ink-muted">
          <span className="font-medium text-ink">Inspector: </span>
          {report.inspectorNote}
        </p>
      )}
    </article>
  )
}
