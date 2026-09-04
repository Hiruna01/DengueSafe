export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
