import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react'
import { Reveal } from '../../../shared'
import StatStrip from './StatStrip'

/*
  Asymmetric by construction: the headline holds the left seven columns, the
  live figures sit in the right four, and the gutter between them is deliberate
  rather than an accident of centring.
*/
export default function HeroSection({ stats }) {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-12 sm:px-8 lg:pt-24 lg:pb-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Community breeding-site surveillance
            </p>

            <h1 className="mt-6 font-serif text-3xl text-ink lg:text-4xl">
              Dengue breeds in the water we walk past every day.
            </h1>

            <p className="mt-6 max-w-xl text-base text-ink-muted">
              Not in swamps or rivers — in a tyre behind a garage, an uncovered tank, a blocked
              gutter. Report one and it reaches the Public Health Inspector for your division,
              ranked against every other site by how much dengue it is likely to produce.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-accent bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:border-accent-hover hover:bg-accent-hover"
              >
                Report a breeding site
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/risk-board"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink-subtle hover:bg-surface"
              >
                View the risk board
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <div className="border-t-2 border-ink pt-5">
              <h2 className="text-xs font-medium tracking-widest text-ink-muted uppercase">
                Where the country stands today
              </h2>
              <div className="mt-5">
                <StatStrip {...stats} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
