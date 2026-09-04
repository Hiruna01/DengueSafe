/*
  Report workflow status. Deliberately quieter than RiskBadge: only the two
  ends of the workflow carry colour, so a table of mixed statuses does not
  compete with the risk banding beside it.
*/
const STATUS_STYLES = {
  Reported: 'border-line-strong bg-canvas text-ink-muted',
  Inspected: 'border-accent/25 bg-accent-soft text-accent',
  Cleared: 'border-line-strong bg-surface text-ink',
  NoticeIssued: 'border-danger/20 bg-danger-soft text-danger',
}

const STATUS_LABELS = {
  Reported: 'Reported',
  Inspected: 'Inspected',
  Cleared: 'Cleared',
  NoticeIssued: 'Notice issued',
}

export const REPORT_STATUSES = ['Reported', 'Inspected', 'Cleared', 'NoticeIssued']

export const statusLabel = (status) => STATUS_LABELS[status] ?? status

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Reported

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs whitespace-nowrap ${style} ${className}`}
    >
      {statusLabel(status)}
    </span>
  )
}
