/** Shared label / error / hint chrome so every control lines up identically. */
export default function Field({ id, label, error, hint, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  )
}

export const controlClasses = (hasError) =>
  [
    'w-full rounded border bg-surface px-3 py-2 text-sm text-ink',
    'placeholder:text-ink-subtle transition-colors',
    'disabled:opacity-50',
    hasError ? 'border-danger' : 'border-line-strong hover:border-ink-subtle',
  ].join(' ')
