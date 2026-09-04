/*
  Neutral chip primitive. Risk bands and report statuses have their own
  components — this is for everything else (counts, site types, plain tags),
  and knows nothing about the domain.
*/
const TONES = {
  neutral: 'border-line-strong bg-canvas text-ink-muted',
  quiet: 'border-line-strong bg-canvas text-ink-subtle',
  solid: 'border-line-strong bg-surface text-ink',
  accent: 'border-accent/25 bg-accent-soft text-accent',
  danger: 'border-danger/20 bg-danger-soft text-danger',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs whitespace-nowrap ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
