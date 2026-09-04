import { RiskBadge } from '../../../shared'

/*
  The risk model, drawn. Vector risk runs left to right, recent cases bottom to
  top, and the four cells are the four bands the backend assigns.

  Divisions are placed by the `riskBand` the API returns and the action text is
  read off whichever divisions landed in the cell — neither the thresholds nor
  the recommended actions are restated here, so this cannot drift away from
  RiskService.
*/
const QUADRANTS = [
  { band: 'Investigate', column: 'Few sites reported', row: 'Many recent cases' },
  { band: 'Emergency', column: 'Many sites open', row: 'Many recent cases' },
  { band: 'Monitor', column: 'Few sites reported', row: 'Few recent cases' },
  { band: 'Prevent', column: 'Many sites open', row: 'Few recent cases' },
]

/*
  Investigate is the quadrant the whole model exists to surface: people are
  falling ill in a division where almost nothing has been reported, so the
  sources are out there and unfound. It is drawn louder than the other three on
  purpose.
*/
const isKeyInsight = (band) => band === 'Investigate'

function Quadrant({ band, column, row, divisions }) {
  const key = isKeyInsight(band)
  const action = divisions[0]?.recommendedAction

  return (
    <div
      className={[
        'flex min-w-0 flex-col gap-2 p-2.5 sm:gap-2.5 sm:p-4',
        key ? 'border-2 border-study bg-study-soft' : 'border border-line bg-surface',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <RiskBadge band={band} />
        {key && <span className="text-xs text-study">Key insight</span>}
        <span className="ml-auto text-xs tabular-nums text-ink-subtle">{divisions.length}</span>
      </div>

      {/* The axis labels already say this at narrow widths; the words cost too
          much height in a 2×2 grid on a phone. */}
      <p className="hidden text-xs text-ink-subtle sm:block">
        {column} · {row}
      </p>

      {key && (
        <p className="text-xs text-study">
          The one quadrant where the habitat driving transmission is still unknown. Everywhere
          else, the sites are already on a list.
        </p>
      )}

      {action ? (
        <p className="text-sm text-ink">{action}</p>
      ) : (
        <p className="text-sm text-ink-subtle">No divisions here.</p>
      )}

      <ul className="flex flex-col gap-1.5 border-t border-line pt-2.5">
        {divisions.map((division) => (
          <li key={division.id} className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">{division.name}</p>
            <p className="text-xs tabular-nums text-ink-subtle">
              {division.openReportCount} open ·{' '}
              {division.recentCaseCount === 1 ? '1 case' : `${division.recentCaseCount} cases`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function QuadrantMatrix({ divisions }) {
  const byBand = (band) => divisions.filter((division) => division.riskBand === band)

  return (
    <div className="flex gap-2 sm:gap-3">
      {/* Vertical axis. Rotated upright text, so it reads bottom-to-top like the axis it labels. */}
      <div className="flex w-5 shrink-0 items-center justify-center sm:w-6">
        <p
          className="text-xs whitespace-nowrap text-ink-muted"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Recent cases →
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
          {QUADRANTS.map((quadrant) => (
            <Quadrant key={quadrant.band} {...quadrant} divisions={byBand(quadrant.band)} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-ink-muted sm:mt-3">Open breeding sites →</p>
      </div>
    </div>
  )
}
