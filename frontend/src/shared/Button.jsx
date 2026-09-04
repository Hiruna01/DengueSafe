const VARIANTS = {
  primary:
    'bg-accent text-white border-accent hover:bg-accent-hover hover:border-accent-hover',
  secondary:
    'bg-surface text-ink border-line-strong hover:border-ink-subtle',
  ghost:
    'bg-transparent text-ink-muted border-transparent hover:text-ink hover:bg-accent-soft',
  danger:
    'bg-surface text-danger border-line-strong hover:border-danger hover:bg-danger-soft',
}

export default function Button({
  variant = 'secondary',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded border px-3.5 py-2',
        'text-sm font-medium whitespace-nowrap transition-colors',
        'disabled:opacity-45 disabled:pointer-events-none',
        VARIANTS[variant] ?? VARIANTS.secondary,
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent opacity-70"
        />
      )}
      {children}
    </button>
  )
}
