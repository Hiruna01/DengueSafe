import { Reveal } from '../../../shared'

/*
  Why a queue beats first-come-first-served, shown with the model's own numbers.

  Every figure here is fetched from GET /api/risk-model rather than written into
  the page, so the copy cannot drift away from RiskService. While it loads, the
  rows hold their height and show a dash — the block never resizes.
*/
const PLACEHOLDER_ROWS = ['a', 'b', 'c', 'd', 'e', 'f']

function WeightRow({ label, weight, max }) {
  const width = max > 0 ? (weight / max) * 100 : 0

  return (
    <li className="grid grid-cols-12 items-center gap-3 border-t border-line py-2.5 first:border-t-0">
      <span className="col-span-6 truncate text-sm text-ink sm:col-span-5">{label}</span>
      <span className="col-span-4 sm:col-span-6">
        <span aria-hidden="true" className="block h-1.5 w-full rounded-sm bg-accent-soft">
          <span className="block h-full rounded-sm bg-accent" style={{ width: `${width}%` }} />
        </span>
      </span>
      <span className="col-span-2 text-right font-serif text-base tabular-nums text-ink sm:col-span-1">
        {weight}
      </span>
    </li>
  )
}

function PlaceholderRow() {
  return (
    <li className="grid grid-cols-12 items-center gap-3 border-t border-line py-2.5 first:border-t-0">
      <span className="col-span-6 text-sm text-ink-subtle sm:col-span-5">—</span>
      <span className="col-span-4 sm:col-span-6">
        <span aria-hidden="true" className="block h-1.5 w-full rounded-sm bg-accent-soft" />
      </span>
      <span className="col-span-2 text-right font-serif text-base text-ink-subtle sm:col-span-1">
        —
      </span>
    </li>
  )
}

export default function PrioritisationSection({ model }) {
  const weights = model?.siteTypeWeights ?? []
  const max = weights.reduce((highest, entry) => Math.max(highest, entry.weight), 0)

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <h2 className="font-serif text-2xl text-ink">
              Not all standing water is the same problem
            </h2>
            <p className="mt-5 text-sm text-ink-muted">
              A saucer under a pot plant dries out in a day of sun. A discarded tyre is shaded,
              holds water through a dry spell and is almost never emptied — which is why tyres and
              uncovered storage tanks dominate national larval surveys. Each report is scored on
              what kind of container it is, so an inspector with one afternoon spends it where the
              mosquitoes actually are.
            </p>
            <p className="mt-4 text-sm text-ink-muted">
              Then the clock is applied. <i>Aedes aegypti</i> takes roughly seven to ten days to go
              from egg to biting adult, so a site still standing after a week has not merely been
              waiting — it has produced a generation. A report's score rises as it ages, and an
              old low-weight site can outrank a fresh high-weight one.
            </p>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <h3 className="text-xs font-medium tracking-widest text-ink-muted uppercase">
              Relative larval productivity
            </h3>
            <ul className="mt-4">
              {weights.length > 0
                ? weights.map((entry) => (
                    <WeightRow
                      key={entry.siteType}
                      label={entry.label}
                      weight={entry.weight}
                      max={max}
                    />
                  ))
                : PLACEHOLDER_ROWS.map((key) => <PlaceholderRow key={key} />)}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              Weights run 2 to 5 and are published by the scoring service, not written into this
              page.
            </p>

            <h3 className="mt-10 text-xs font-medium tracking-widest text-ink-muted uppercase">
              What ageing does to a score
            </h3>
            <dl className="mt-4">
              <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5 first:border-t-0">
                <dt className="text-sm text-ink">
                  Open past{' '}
                  <span className="tabular-nums">{model?.ageingThresholdDays ?? '—'}</span> days
                </dt>
                <dd className="font-serif text-base tabular-nums text-ink">
                  ×{model?.ageingMultiplier ?? '—'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5">
                <dt className="text-sm text-ink">
                  Open past{' '}
                  <span className="tabular-nums">{model?.severeAgeingThresholdDays ?? '—'}</span>{' '}
                  days
                </dt>
                <dd className="font-serif text-base tabular-nums text-ink">
                  ×{model?.severeAgeingMultiplier ?? '—'}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
