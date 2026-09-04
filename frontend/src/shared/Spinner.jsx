export default function Spinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 py-10 ${className}`} role="status">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-r-accent"
      />
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  )
}
