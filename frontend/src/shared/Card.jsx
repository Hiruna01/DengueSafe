export default function Card({ title, description, actions, className = '', children }) {
  const hasHeader = title || description || actions

  return (
    <section
      className={`rounded border border-line bg-surface ${className}`}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-medium text-ink">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  )
}
