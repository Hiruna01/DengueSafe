import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, EmptyState, ErrorMessage, Input, Spinner } from '../../../shared'
import { getRememberedPhone, getReportsByPhone, rememberPhone } from '../api/reportsApi'
import MyReportCard from '../components/MyReportCard'

const PHONE_PATTERN = /^0[0-9]{9}$/

/*
  There is no sign-in, so a resident finds their reports by typing back the
  number they filed them under. The number is kept in component state and
  localStorage only — never in the URL, so a shared link carries nobody's phone
  number.
*/
export default function MyReportsPage() {
  const [phone, setPhone] = useState(getRememberedPhone)
  const [reports, setReports] = useState(null)
  const [searchedPhone, setSearchedPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [error, setError] = useState('')

  const lookup = useCallback((value) => {
    setLoading(true)
    setError('')
    setPhoneError('')
    setSearchedPhone(value)

    getReportsByPhone(value)
      .then((found) => {
        setReports(found)
        rememberPhone(value)
      })
      .catch((err) => {
        setReports(null)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // Someone who has just submitted a report arrives with their number already
  // remembered; look it up for them rather than making them type it again.
  useEffect(() => {
    const remembered = getRememberedPhone()
    if (PHONE_PATTERN.test(remembered)) lookup(remembered)
  }, [lookup])

  function handleSubmit(event) {
    event.preventDefault()

    const value = phone.trim()

    if (!PHONE_PATTERN.test(value)) {
      setPhoneError('Enter a valid mobile number, e.g. 0771234567.')
      return
    }

    lookup(value)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-medium tracking-tight text-ink">My reports</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter the phone number you filed with to see what has happened to your reports.
        </p>
      </header>

      <Card>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="min-w-0 flex-1">
            <Input
              id="phone"
              label="Phone number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="0771234567"
              hint="The same number you gave when you reported."
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value)
                setPhoneError('')
              }}
              error={phoneError}
              disabled={loading}
            />
          </div>
          <Button type="submit" variant="primary" loading={loading} className="sm:mt-6">
            Find my reports
          </Button>
        </form>
      </Card>

      <ErrorMessage
        message={error}
        onRetry={searchedPhone ? () => lookup(searchedPhone) : undefined}
      />

      {loading ? (
        <Spinner label="Looking up your reports" />
      ) : reports === null ? (
        !error && (
          <Card>
            <EmptyState
              title="Nothing looked up yet"
              description="Type the number you reported from and we will show every report filed from it, with its current status."
            />
          </Card>
        )
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            title="No reports from that number"
            description="Nothing has been filed from this number yet. Check the digits, or report a site you have seen."
            action={
              <Link
                to="/report"
                className="inline-flex items-center justify-center rounded border border-accent bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-accent-hover hover:bg-accent-hover"
              >
                Report a breeding site
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-ink-muted">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'} filed from this number,
            newest first.
          </p>
          {reports.map((report) => (
            <MyReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
