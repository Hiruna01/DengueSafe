import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Reveal, RiskBadge } from '../../../shared'

const PLACEHOLDER_ROWS = ['a', 'b', 'c', 'd']

function DivisionRow({ division, rank }) {
  return (
    <li className="border-t border-line first:border-t-0">
      <Link
        to="/risk-board"
        className="grid grid-cols-12 items-center gap-3 py-4 transition-colors hover:bg-canvas"
      >
        <span className="col-span-1 font-serif text-base tabular-nums text-ink-subtle">
          {rank}
        </span>
        <span className="col-span-7 min-w-0 sm:col-span-5">
          <span className="block truncate text-sm font-medium text-ink">{division.name}</span>
          <span className="block truncate text-xs text-ink-muted">
            {division.district} District
          </span>
        </span>
        <span className="col-span-4 text-right sm:col-span-3 sm:text-left">
          <RiskBadge band={division.riskBand} />
        </span>
        <span className="col-span-12 grid grid-cols-2 gap-3 border-t border-line pt-3 sm:col-span-3 sm:border-t-0 sm:pt-0 sm:text-right">
          <span className="text-xs text-ink-muted">
            <span className="block font-serif text-base tabular-nums text-ink">
              {division.openReportCount}
            </span>
            sites open
          </span>
          <span className="text-xs text-ink-muted">
            <span className="block font-serif text-base tabular-nums text-ink">
              {division.recentCaseCount}
            </span>
            recent cases
          </span>
        </span>
      </Link>
    </li>
  )
}

function PlaceholderRow() {
  return (
    <li className="border-t border-line first:border-t-0">
      <div className="grid grid-cols-12 items-center gap-3 py-4">
        <span className="col-span-1 font-serif text-base text-ink-subtle">—</span>
        <span className="col-span-7 sm:col-span-5">
          <span className="block h-4 w-32 rounded-sm bg-canvas" />
          <span className="mt-1 block h-3 w-20 rounded-sm bg-canvas" />
        </span>
        <span className="col-span-4 sm:col-span-3">
          <span className="block h-5 w-20 rounded-sm bg-canvas" />
        </span>
        <span className="col-span-12 sm:col-span-3" />
      </div>
    </li>
  )
}

/** The top of the board, as a trailer for the board itself. */
export default function RiskPreviewSection({ divisions }) {
  const top = divisions?.slice(0, 4) ?? []

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl text-ink">Where risk sits right now</h2>
            <p className="mt-3 text-sm text-ink-muted">
              The four divisions needing attention first, scored on sites still open against cases
              confirmed in the last fortnight.
            </p>
          </div>
          <Link
            to="/risk-board"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            All divisions on the risk board
            <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={120} className="mt-8">
          <ul>
            {top.length > 0
              ? top.map((division, index) => (
                  <DivisionRow key={division.id} division={division} rank={index + 1} />
                ))
              : PLACEHOLDER_ROWS.map((key) => <PlaceholderRow key={key} />)}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
