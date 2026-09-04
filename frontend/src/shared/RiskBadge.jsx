/*
  The four risk bands, each with a fixed colour. The mapping is the whole point
  of the component — an officer should recognise a band by colour before they
  read the word — so nothing here is configurable by the caller.
*/
const BAND_STYLES = {
  Emergency: 'border-danger/25 bg-danger-soft text-danger',
  Prevent: 'border-warn/25 bg-warn-soft text-warn',
  Investigate: 'border-study/25 bg-study-soft text-study',
  Monitor: 'border-accent/25 bg-accent-soft text-accent',
}

const BAND_LABELS = {
  Emergency: 'Emergency',
  Prevent: 'Prevent',
  Investigate: 'Investigate',
  Monitor: 'Monitor',
}

export const RISK_BANDS = ['Emergency', 'Prevent', 'Investigate', 'Monitor']

export default function RiskBadge({ band, className = '' }) {
  const style = BAND_STYLES[band] ?? 'border-line-strong bg-canvas text-ink-muted'

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs whitespace-nowrap ${style} ${className}`}
    >
      {BAND_LABELS[band] ?? band}
    </span>
  )
}
