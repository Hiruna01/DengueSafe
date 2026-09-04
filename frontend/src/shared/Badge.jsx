import { STATUS_LABELS } from '../features/items/itemsApi'

/*
  Status carries the only colour in the table, so the palette stays tight:
  the accent marks work in progress, done is neutral-positive, rejected reads
  as the danger tone, pending is plain.
*/
const STATUS_STYLES = {
  Pending: 'border-line-strong bg-canvas text-ink-muted',
  InProgress: 'border-accent/25 bg-accent-soft text-accent',
  Completed: 'border-line-strong bg-surface text-ink',
  Rejected: 'border-danger/20 bg-danger-soft text-danger',
}

const PRIORITY_STYLES = {
  Low: 'border-line-strong bg-canvas text-ink-subtle',
  Medium: 'border-line-strong bg-canvas text-ink-muted',
  High: 'border-danger/20 bg-danger-soft text-danger',
}

export default function Badge({ status, priority, children }) {
  const style = status
    ? (STATUS_STYLES[status] ?? STATUS_STYLES.Pending)
    : priority
      ? (PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Medium)
      : 'border-line-strong bg-canvas text-ink-muted'

  const text = children ?? (status ? (STATUS_LABELS[status] ?? status) : priority)

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs whitespace-nowrap ${style}`}
    >
      {text}
    </span>
  )
}
