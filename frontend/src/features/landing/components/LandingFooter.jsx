import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'

export default function LandingFooter() {
  return (
    <footer className="bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-8 border-t-2 border-ink pt-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-serif text-lg text-ink">DengueWatch</p>
            <p className="mt-2 text-sm text-ink-muted">
              Breeding-site reporting and risk prioritisation for Sri Lankan public health
              divisions.
            </p>
            <Link
              to="/report"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Report a breeding site
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5 text-sm">
            <Link to="/about" className="text-ink hover:text-accent">
              About this service
            </Link>
            <Link to="/risk-board" className="text-ink hover:text-accent">
              Risk board
            </Link>
            <Link to="/login" className="text-ink hover:text-accent">
              Officer sign-in
            </Link>
          </nav>
        </div>

        <p className="mt-8 text-xs text-ink-subtle">
          Built by the DengueWatch team for the SLIIT Software Engineering Foundations
          mini-hackathon, 2026. Case records hold no patient names, addresses or contact details.
        </p>
      </div>
    </footer>
  )
}
