import { CheckCircle, Megaphone, SortAscending } from '@phosphor-icons/react'
import { Reveal } from '../../../shared'

/*
  A sequence, not a set. The three steps run along one line — vertical on a
  phone, horizontal from md up — and their columns are deliberately unequal so
  the eye reads an order rather than three interchangeable boxes.
*/
const STEPS = [
  {
    icon: Megaphone,
    title: 'A resident reports',
    span: 'md:col-span-4',
    body: 'A site type, a division, and a landmark specific enough to find the place again. No account, nothing to install, about a minute.',
  },
  {
    icon: SortAscending,
    title: 'An officer prioritises',
    span: 'md:col-span-5',
    body: 'The report is scored on what kind of container it is and how long it has stood, then dropped into the division queue in rank order — so the tyre dump outranks the pot saucer reported an hour earlier.',
  },
  {
    icon: CheckCircle,
    title: 'The site is cleared',
    span: 'md:col-span-3',
    body: 'Inspected, cleared, or a notice served on the occupier. The division’s risk band moves with it.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <Reveal className="max-w-xl">
          <h2 className="font-serif text-2xl text-ink">From one resident to one cleared site</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Three steps, and the second is the one that makes the difference.
          </p>
        </Reveal>

        <div className="relative mt-12">
          {/* The connecting line: down the left on a phone, across the markers from md up. */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[1.125rem] w-px bg-line-strong md:top-[1.125rem] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto"
          />

          <ol className="relative grid gap-10 md:grid-cols-12 md:gap-8">
            {STEPS.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                delay={index * 120}
                className={`flex gap-5 md:flex-col md:gap-0 ${step.span}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas text-accent">
                  <step.icon aria-hidden="true" size={18} />
                </span>

                <div className="min-w-0 md:mt-5">
                  <p className="text-xs font-medium tracking-widest text-ink-muted uppercase">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1.5 font-serif text-lg text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
