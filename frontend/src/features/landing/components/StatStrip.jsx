import { useCountUp } from '../../../shared'

/*
  The live figures in the hero. Every value keeps its own line height whether or
  not the number has arrived, so the strip never resizes when the API answers —
  a loading stat is an em dash of the same size, not an absence.
*/
function Stat({ label, value, caption, delay }) {
  const counted = useCountUp(value, 1100 + delay)
  const loading = value === null || value === undefined

  return (
    <div className="flex flex-col gap-1 border-t border-line pt-4 first:border-t-0 first:pt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5 sm:first:border-l-0 sm:first:pl-0 lg:border-t lg:border-l-0 lg:pt-4 lg:pl-0 lg:first:border-t-0 lg:first:pt-0">
      <p
        aria-busy={loading}
        className="font-serif text-2xl tabular-nums text-ink"
      >
        {loading ? <span className="text-ink-subtle">—</span> : counted?.toLocaleString('en-GB')}
      </p>
      <p className="text-xs font-medium tracking-wide text-ink uppercase">{label}</p>
      <p className="text-xs text-ink-muted">{caption}</p>
    </div>
  )
}

export default function StatStrip({ emergencyDivisions, openReports, recentCases, caseWindowDays }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-0 lg:grid-cols-1 lg:gap-0">
      <Stat
        label="At emergency level"
        value={emergencyDivisions}
        caption="Divisions with sites open and cases confirmed"
        delay={0}
      />
      <Stat
        label="Breeding sites open"
        value={openReports}
        caption="Reported, not yet cleared"
        delay={120}
      />
      <Stat
        label="Cases confirmed"
        value={recentCases}
        caption={caseWindowDays ? `Last ${caseWindowDays} days` : 'Recent window'}
        delay={240}
      />
    </div>
  )
}
