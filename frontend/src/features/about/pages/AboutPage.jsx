import { Link } from 'react-router-dom'
import { Card, RiskBadge } from '../../../shared'

/*
  Static explainer. No API call, so there is no loading or error state to
  handle — everything here is prose, laid out one column wide so it stays
  readable from 375px up.
*/

const CONTAINERS = [
  {
    name: 'Discarded tyres',
    weight: 'Highest',
    why: 'Shaded, hold water through dry spells, and almost never emptied. Consistently the top producer in national larval surveys.',
  },
  {
    name: 'Water storage tanks',
    weight: 'Highest',
    why: 'Uncovered tanks and barrels breed continuously, and their owners depend on them, so they are rarely tipped out.',
  },
  {
    name: 'Construction sites',
    weight: 'High',
    why: 'Large volumes of standing water in sumps, foundations and stacked materials — intermittent, but productive while they last.',
  },
  {
    name: 'Roof gutters',
    weight: 'Moderate',
    why: 'A blocked run holds water out of sight for weeks. Nobody looks up.',
  },
  {
    name: 'Plant pot saucers',
    weight: 'Lower',
    why: 'Small and quick to dry, but there are hundreds of them in any neighbourhood.',
  },
  {
    name: 'Ornamental ponds',
    weight: 'Lower',
    why: 'A stocked pond carries fish that eat larvae. A neglected one does not.',
  },
]

const BANDS = [
  {
    band: 'Emergency',
    meaning: 'Breeding sites are piling up and people are already falling ill.',
  },
  {
    band: 'Prevent',
    meaning:
      'Sites are accumulating but transmission has not started — the cheapest moment to act.',
  },
  {
    band: 'Investigate',
    meaning:
      'Cases are appearing with almost nothing reported, so the real sources have not been found.',
  },
  { band: 'Monitor', meaning: 'Both measures are low. Routine surveillance continues.' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium tracking-tight text-ink">
          Why this service exists
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          The outbreak, the containers that drive it, and how a report from a resident reaches an
          inspector.
        </p>
      </header>

      <Card title="Sri Lanka's 2026 outbreak">
        <div className="flex flex-col gap-3 text-sm text-ink-muted">
          <p>
            By early August 2026 the country had passed{' '}
            <span className="font-medium text-ink">90,000 reported cases and 65 deaths</span> — the
            largest dengue season since the 2017 epidemic. The{' '}
            <span className="font-medium text-ink">Western Province</span> carries the highest share
            of them, concentrated in the dense, high-rainfall divisions around Colombo where
            containers, construction and people are packed together.
          </p>
          <p>
            The National Dengue Review in August 2026 named{' '}
            <span className="font-medium text-ink">
              early warning of high-risk areas a national priority
            </span>
            . Case counts alone arrive too late to act on: by the time a division's numbers climb,
            the mosquitoes that caused them bred weeks earlier. What is missing is a view of the
            habitat <i>before</i> anyone is ill — which is what this service is for.
          </p>
        </div>
      </Card>

      <Card title="What a breeding site is">
        <div className="flex flex-col gap-3 text-sm text-ink-muted">
          <p>
            <i>Aedes aegypti</i>, the mosquito that carries dengue, does not breed in rivers or
            marshes. It breeds in <span className="font-medium text-ink">containers</span> — any
            artificial vessel holding clean, still water near where people live. A tyre in a back
            garden, an uncovered tank, a blocked gutter, a saucer under a pot plant.
          </p>
          <p>
            Eggs laid on the inside wall of a container hatch when water covers them and reach
            biting adults in roughly{' '}
            <span className="font-medium text-ink">seven to ten days</span>. That is the entire
            window. A container emptied inside a week produces nothing; the same container left
            standing a fortnight has produced two generations. It is why a report that sits
            unactioned scores higher here the longer it waits.
          </p>
        </div>
      </Card>

      <Card
        title="Which containers matter most"
        description="Not all standing water is equal — these weightings drive the risk score."
      >
        <ul className="flex flex-col gap-4">
          {CONTAINERS.map((container) => (
            <li key={container.name} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium text-ink">{container.name}</p>
                <p className="text-xs text-ink-subtle">{container.weight} risk</p>
              </div>
              <p className="text-sm text-ink-muted">{container.why}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="How a report reaches an inspector">
        <ol className="flex flex-col gap-4">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
              1
            </span>
            <p className="min-w-0 flex-1 text-sm text-ink-muted">
              <span className="font-medium text-ink">A resident reports what they saw.</span> No
              account, no app to install — a site type, a division, a description and a landmark
              specific enough to find the place again.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
              2
            </span>
            <p className="min-w-0 flex-1 text-sm text-ink-muted">
              <span className="font-medium text-ink">The report is scored and queued.</span> The
              Public Health Inspector for that division works a queue ordered by risk rather than by
              arrival time, so the tyre dump outranks the pot saucer reported an hour earlier.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
              3
            </span>
            <p className="min-w-0 flex-1 text-sm text-ink-muted">
              <span className="font-medium text-ink">The inspector visits and records what
              happened</span> — inspected, cleared, or a legal notice issued to the occupier. The
              reporter's phone number is held only so that visit can be arranged.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
              4
            </span>
            <p className="min-w-0 flex-1 text-sm text-ink-muted">
              <span className="font-medium text-ink">The division's risk band updates.</span> Open
              sites and confirmed cases are scored as two separate measures, and where they cross
              decides what the division is told to do.
            </p>
          </li>
        </ol>
      </Card>

      <Card title="Two independent measures">
        <div className="flex flex-col gap-3 text-sm text-ink-muted">
          <p>
            <span className="font-medium text-ink">Vector risk</span> measures how much breeding
            habitat is sitting unaddressed. Each open report scores by site type, and that score
            grows the longer it stays open. It is a leading indicator: habitat exists before anyone
            is ill.
          </p>
          <p>
            <span className="font-medium text-ink">Transmission risk</span> counts confirmed cases in
            the division over the last 14 days — one mosquito generation plus the time it takes for
            an infected person to fall ill and be diagnosed. It is a lagging indicator.
          </p>
          <p>
            Crossing the two is what makes the result useful. The same case count means something
            very different depending on whether the breeding sites driving it have been found.
          </p>
        </div>
      </Card>

      <Card title="The four bands">
        <ul className="flex flex-col gap-3">
          {BANDS.map((entry) => (
            <li key={entry.band} className="flex flex-wrap items-start gap-3">
              <RiskBadge band={entry.band} />
              <p className="min-w-0 flex-1 text-sm text-ink-muted">{entry.meaning}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="What is not collected">
        <p className="text-sm text-ink-muted">
          Case records hold a division, an age band, a severity and whether the patient was
          hospitalised. No names, addresses or contact details are stored against a case. A
          reporter's phone number is kept so an inspector can follow up, and is never shown on any
          public view.
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 text-sm text-ink-muted">
            Seen standing water somewhere near you? It takes about a minute.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center justify-center rounded border border-accent bg-accent px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:border-accent-hover hover:bg-accent-hover"
          >
            Report a breeding site
          </Link>
        </div>
      </Card>
    </div>
  )
}
