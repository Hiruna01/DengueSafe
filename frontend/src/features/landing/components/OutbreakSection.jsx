import { Reveal } from '../../../shared'

/*
  The 2026 season, as figures rather than cards. Set on the one dark band in the
  page: the numbers are the argument for everything below them, and they should
  read like the front of a report, not like a feature list.
*/
const FIGURES = [
  {
    value: '90,000+',
    caption: 'Reported cases by early August 2026',
    detail: 'More than the whole of 2025, with the north-east monsoon still ahead.',
  },
  {
    value: '65',
    caption: 'Deaths in the same period',
    detail: 'Dengue haemorrhagic fever remains the severe form clinicians watch for.',
  },
  {
    value: '2017',
    caption: 'The last season this large',
    detail: 'The epidemic that pushed national case management into hospital corridors.',
  },
]

export default function OutbreakSection() {
  return (
    <section id="the-problem" className="bg-ink text-canvas">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <h2 className="font-serif text-2xl text-canvas">
              The largest outbreak since 2017
            </h2>
            <p className="mt-4 text-sm text-canvas/70">
              Western Province reports the highest share of it — the same dense, high-rainfall
              divisions around Colombo where containers, construction and people sit close
              together.
            </p>
            <p className="mt-4 text-sm text-canvas/70">
              The National Dengue Review in August 2026 named early warning of high-risk areas a
              national priority. Case counts arrive too late to act on: by the time a division's
              numbers climb, the mosquitoes that caused them bred weeks earlier.
            </p>
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6">
            <dl>
              {FIGURES.map((figure, index) => (
                <Reveal
                  key={figure.value}
                  delay={index * 100}
                  className="grid gap-2 border-t border-canvas/15 py-7 first:border-t-0 first:pt-0 sm:grid-cols-12 sm:items-baseline sm:gap-6"
                >
                  <dt className="font-serif text-3xl tabular-nums text-canvas sm:col-span-5 lg:text-4xl">
                    {figure.value}
                  </dt>
                  <dd className="sm:col-span-7">
                    <p className="text-sm font-medium text-canvas">{figure.caption}</p>
                    <p className="mt-1 text-sm text-canvas/60">{figure.detail}</p>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
