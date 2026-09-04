import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Button, ErrorMessage, Input } from '../../../shared'
import { useAuth } from '../../../app/AuthContext'

/*
  Officer sign-in. Same design language as the landing page — warm ground,
  display serif, one teal accent — because it is the same service, and an
  officer arriving from the footer link should not feel handed to a different
  application.
*/
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, restoring } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Where they were headed before being redirected here, if anywhere.
  const destination = location.state?.from?.pathname ?? '/queue'

  if (!restoring && isAuthenticated) {
    return <Navigate to={destination} replace />
  }

  const update = (key) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  function validate() {
    const found = {}

    if (!form.email.trim()) {
      found.email = 'Enter your work email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      found.email = 'That does not look like an email address.'
    }

    if (!form.password) found.password = 'Enter your password.'

    return found
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validate()
    setErrors(found)

    if (Object.keys(found).length > 0) {
      setError('')
      return
    }

    setSaving(true)
    setError('')

    try {
      await login(form.email.trim(), form.password)
      navigate(destination, { replace: true })
    } catch (err) {
      // The API answers wrong-email and wrong-password identically on purpose;
      // this shows whatever it said rather than guessing which one it was.
      setError(err.message)
      setErrors(err.fieldErrors ?? {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:py-24">
      <div className="lg:col-span-5">
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-accent uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Officer access
        </p>

        <h1 className="mt-6 font-serif text-2xl text-ink lg:text-3xl">Sign in to the queue</h1>

        <p className="mt-5 max-w-md text-sm text-ink-muted">
          For public health inspectors and administrators. Signing in opens the prioritised
          inspection queue, case notification and the division dashboard.
        </p>

        <p className="mt-4 max-w-md text-sm text-ink-muted">
          Accounts are issued by an administrator — there is no self-registration. Reporting a
          breeding site never needs one.
        </p>

        <Link
          to="/report"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          Report a breeding site instead
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <div className="border-t-2 border-ink bg-surface px-5 py-6 sm:px-7 sm:py-7">
          <h2 className="font-serif text-lg text-ink">Officer sign-in</h2>

          <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
            <ErrorMessage message={error} />

            <Input
              id="email"
              name="email"
              label="Work email"
              type="email"
              required
              autoComplete="username"
              placeholder="name@moh.lk"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              disabled={saving}
            />

            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              disabled={saving}
            />

            <div className="pt-1">
              <Button type="submit" variant="primary" loading={saving} className="w-full sm:w-auto">
                {saving ? 'Signing in…' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
