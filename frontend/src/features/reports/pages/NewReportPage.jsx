import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, ErrorMessage, Input, Select, Textarea } from '../../../shared'
import { getDivisionRisk } from '../../divisions/api/divisionsApi'
import {
  SITE_TYPES,
  SITE_TYPE_LABELS,
  createReport,
  rememberPhone,
  siteTypeLabel,
} from '../api/reportsApi'

const EMPTY = {
  siteType: '',
  divisionId: '',
  description: '',
  landmark: '',
  reporterName: '',
  reporterPhone: '',
}

/** Mirrors the backend's ReporterPhone rule: 10 digits, leading zero. */
const PHONE_PATTERN = /^0[0-9]{9}$/

/*
  Checked here so a resident is told what is wrong before a round trip. The
  backend validates the same rules again and its messages win — anything it
  rejects comes back in `fieldErrors` and replaces whatever this found.
*/
function validate(form) {
  const errors = {}

  if (!form.siteType) errors.siteType = 'Choose the kind of site you saw.'
  if (!form.divisionId) errors.divisionId = 'Choose the division this is in.'

  if (!form.description.trim()) {
    errors.description = 'Please describe what you saw.'
  } else if (form.description.trim().length > 500) {
    errors.description = 'Please keep the description under 500 characters.'
  }

  if (form.landmark.trim().length > 200) {
    errors.landmark = 'Please keep the landmark under 200 characters.'
  }

  if (!form.reporterName.trim()) {
    errors.reporterName = 'Please tell us your name.'
  } else if (form.reporterName.trim().length > 100) {
    errors.reporterName = 'Please keep your name under 100 characters.'
  }

  if (!form.reporterPhone.trim()) {
    errors.reporterPhone = 'We need a number so the inspector can reach you.'
  } else if (!PHONE_PATTERN.test(form.reporterPhone.trim())) {
    errors.reporterPhone = 'Enter a valid mobile number, e.g. 0771234567.'
  }

  return errors
}

/** The resident-facing submission form. */
export default function NewReportPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [divisions, setDivisions] = useState([])
  const [divisionsLoading, setDivisionsLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  const loadDivisions = useCallback(() => {
    setDivisionsLoading(true)
    setError('')

    getDivisionRisk()
      .then(setDivisions)
      .catch((err) => setError(err.message))
      .finally(() => setDivisionsLoading(false))
  }, [])

  useEffect(loadDivisions, [loadDivisions])

  // Clearing the field's error as it is edited keeps the form from nagging
  // about something the resident is in the middle of fixing.
  const update = (key) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validate(form)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      setError('')
      return
    }

    setSaving(true)
    setError('')

    try {
      const created = await createReport({
        siteType: form.siteType,
        divisionId: Number(form.divisionId),
        description: form.description.trim(),
        landmark: form.landmark.trim(),
        reporterName: form.reporterName.trim(),
        reporterPhone: form.reporterPhone.trim(),
      })

      rememberPhone(form.reporterPhone.trim())
      setSubmitted(created)
    } catch (err) {
      setError(err.message)
      setErrors(err.fieldErrors ?? {})
    } finally {
      setSaving(false)
    }
  }

  function reportAnother() {
    setSubmitted(null)
    setForm((prev) => ({
      ...EMPTY,
      // Same person, most likely the same neighbourhood — keep what does not change.
      reporterName: prev.reporterName,
      reporterPhone: prev.reporterPhone,
      divisionId: prev.divisionId,
    }))
    setErrors({})
    setError('')
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-medium tracking-tight text-ink">Report received</h1>
          <p className="mt-1 text-sm text-ink-muted">
            It is now in the inspection queue for {submitted.divisionName}.
          </p>
        </header>

        <Card>
          <div className="flex flex-col gap-4">
            <div className="rounded border border-line bg-canvas px-4 py-3">
              <p className="text-xs text-ink-muted">Your reference</p>
              <p className="mt-0.5 text-lg tabular-nums text-ink">DW-{submitted.id}</p>
              <p className="mt-1 text-xs text-ink-subtle">
                {siteTypeLabel(submitted.siteType)} · {submitted.divisionName}
              </p>
            </div>

            <p className="text-sm text-ink-muted">
              The Public Health Inspector for the division works the queue by risk, so higher-risk
              sites are visited first. If they need directions they will call the number you gave.
              You can follow the status of this report at any time by looking it up with that
              number.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/my-reports"
                className="inline-flex items-center justify-center rounded border border-accent bg-accent px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:border-accent-hover hover:bg-accent-hover"
              >
                View my reports
              </Link>
              <Button onClick={reportAnother}>Report another site</Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Back to the home page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium tracking-tight text-ink">Report a breeding site</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Anywhere water has been standing for a few days — a tyre, a tank, a blocked gutter.
        </p>
      </header>

      <ErrorMessage message={error} onRetry={divisions.length === 0 ? loadDivisions : undefined} />

      <Card>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Select
            id="siteType"
            label="What did you see?"
            required
            placeholder="Choose a site type"
            value={form.siteType}
            onChange={update('siteType')}
            error={errors.siteType}
            disabled={saving}
            options={SITE_TYPES.map((value) => ({ value, label: SITE_TYPE_LABELS[value] }))}
          />

          <Select
            id="divisionId"
            label="Division"
            required
            placeholder={divisionsLoading ? 'Loading divisions…' : 'Choose a division'}
            hint="The public health division the site sits in."
            value={form.divisionId}
            onChange={update('divisionId')}
            error={errors.divisionId}
            disabled={saving || divisionsLoading}
            options={divisions.map((d) => ({ value: d.id, label: `${d.name} — ${d.district}` }))}
          />

          <Textarea
            id="description"
            label="Description"
            required
            rows={4}
            maxLength={500}
            placeholder="What is holding water, and for how long?"
            value={form.description}
            onChange={update('description')}
            error={errors.description}
            disabled={saving}
          />

          <Input
            id="landmark"
            label="Landmark"
            maxLength={200}
            hint="A nearby shop, junction or building helps the inspector find it."
            value={form.landmark}
            onChange={update('landmark')}
            error={errors.landmark}
            disabled={saving}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="reporterName"
              label="Your name"
              required
              maxLength={100}
              autoComplete="name"
              value={form.reporterName}
              onChange={update('reporterName')}
              error={errors.reporterName}
              disabled={saving}
            />

            <Input
              id="reporterPhone"
              label="Phone"
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="0771234567"
              hint="10 digits, starting with 0. Used to follow up, never shown publicly."
              value={form.reporterPhone}
              onChange={update('reporterPhone')}
              error={errors.reporterPhone}
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="submit" variant="primary" loading={saving}>
              {saving ? 'Submitting…' : 'Submit report'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
