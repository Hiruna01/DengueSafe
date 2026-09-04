import { RiskBadge } from '../../../shared'

/**
 * One scored division, as a resident reads it: where it is, what band it is in,
 * the two counts behind that band, and what the division has been told to do.
 */
export default function DivisionRiskCard({ division }) {
  return (
    <article className="flex flex-col gap-3 rounded border border-line bg-surface px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-ink">{division.name}</h3>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{division.district} District</p>
        </div>
        <RiskBadge band={division.riskBand} className="shrink-0" />
      </div>

      <dl className="flex gap-6 border-y border-line py-2.5">
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">Open reports</dt>
          <dd className="mt-0.5 text-lg tabular-nums text-ink">{division.openReportCount}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">Cases (14 days)</dt>
          <dd className="mt-0.5 text-lg tabular-nums text-ink">{division.recentCaseCount}</dd>
        </div>
      </dl>

      <div>
        <p className="text-xs text-ink-muted">Recommended action</p>
        <p className="mt-0.5 text-sm text-ink">{division.recommendedAction}</p>
      </div>
    </article>
  )
}
