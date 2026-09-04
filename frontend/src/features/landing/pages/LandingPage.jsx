import { useCallback, useEffect, useState } from 'react'
import { IconContext } from '@phosphor-icons/react'
import { ErrorMessage } from '../../../shared'
import { getDivisionRisk, orderByBand } from '../../divisions/api/divisionsApi'
import { getRiskModel } from '../api/riskModelApi'
import HeroSection from '../components/HeroSection'
import HowItWorksSection from '../components/HowItWorksSection'
import LandingFooter from '../components/LandingFooter'
import OutbreakSection from '../components/OutbreakSection'
import PrioritisationSection from '../components/PrioritisationSection'
import RiskPreviewSection from '../components/RiskPreviewSection'

/*
  The public landing page.

  Reads the anonymous per-division endpoint rather than /divisions/dashboard,
  which is now officer-only: the three headline figures are sums of the
  per-division counts that endpoint already publishes, so no signed-out visitor
  is asked for a token to see the front page.

  Both requests are optional to the page working: the editorial sections are
  static, and every live figure has a same-size placeholder, so a slow or
  failed API costs a number rather than a layout. One icon weight is set once
  here, in context, rather than passed to every icon.
*/
const ICON_CONFIG = { weight: 'regular', size: 16 }

export default function LandingPage() {
  const [divisions, setDivisions] = useState(null)
  const [model, setModel] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setError('')

    getDivisionRisk()
      .then(setDivisions)
      .catch((err) => setError(err.message))

    // The scoring parameters are static enough that a failure here is not worth
    // reporting: the section it feeds falls back to its placeholders.
    getRiskModel()
      .then(setModel)
      .catch(() => setModel(null))
  }, [])

  useEffect(load, [load])

  const stats = {
    emergencyDivisions: divisions
      ? divisions.filter((division) => division.riskBand === 'Emergency').length
      : null,
    openReports: divisions
      ? divisions.reduce((total, division) => total + division.openReportCount, 0)
      : null,
    recentCases: divisions
      ? divisions.reduce((total, division) => total + division.recentCaseCount, 0)
      : null,
    caseWindowDays: model?.recentCaseWindowDays ?? null,
  }

  return (
    <IconContext.Provider value={ICON_CONFIG}>
      <HeroSection stats={stats} />

      {error && (
        <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
          <ErrorMessage message={error} onRetry={load} />
        </div>
      )}

      <OutbreakSection />
      <HowItWorksSection />
      <PrioritisationSection model={model} />
      <RiskPreviewSection divisions={divisions ? orderByBand(divisions) : null} />
      <LandingFooter />
    </IconContext.Provider>
  )
}
