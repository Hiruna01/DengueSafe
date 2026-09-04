import { useState } from 'react'
import { Button, ErrorMessage, Input, Select } from '../../../shared'
import { OFFICER_ROLES, createOfficer } from '../api/officersApi'

const EMPTY = {
  fullName: '',
  email: '',
  password: '',
  mohArea: '',
  role: 'Officer',
}

/** Mirrors CreateOfficerDto's rules so the first failure isn't a round trip. */
function validate(form) {
  const errors = {}

  if (!form.fullName.trim()) errors.fullName = 'Enter the officer’s full name.'
  if (!form.email.trim()) {
    errors.email = 'Enter a work email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'That does not look like an email address.'
  }

  if (!form.password) {
    errors.password = 'Set a starting password.'
  } else if (form.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }

  if (!form.mohArea.trim()) errors.mohArea = 'Enter the MOH area they work.'
  if (!form.role) errors.role = 'Choose a role.'

  return errors
}

export default function AddOfficerModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const update = (key) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  function close() {
    setForm(EMPTY)
    setErrors({})
    setError('')
    onClose()
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
      const created = await createOfficer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        mohArea: form.mohArea.trim(),
        role: form.role,
      })

      onCreated(created)
      close()
    } catch (err) {
      // Covers the duplicate-email guard rail, which arrives as a plain 400.
      setError(err.message)
      setErrors(err.fieldErrors ?? {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) close()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-officer-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded border border-line bg-surface p-5"
      >
        <h2 id="add-officer-title" className="font-serif text-lg text-ink">
          Add an officer
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          They sign in with this email and password, and can change the password later.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <ErrorMessage message={error} />

          <Input
            id="fullName"
            label="Full name"
            required
            maxLength={100}
            value={form.fullName}
            onChange={update('fullName')}
            error={errors.fullName}
            disabled={saving}
          />

          <Input
            id="officerEmail"
            label="Work email"
            type="email"
            required
            maxLength={150}
            placeholder="name@moh.lk"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            disabled={saving}
          />

          <Input
            id="officerPassword"
            label="Starting password"
            type="password"
            required
            autoComplete="new-password"
            hint="At least 8 characters."
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            disabled={saving}
          />

          <Input
            id="mohArea"
            label="MOH area"
            required
            maxLength={100}
            placeholder="MOH Kolonnawa"
            value={form.mohArea}
            onChange={update('mohArea')}
            error={errors.mohArea}
            disabled={saving}
          />

          <Select
            id="officerRole"
            label="Role"
            required
            value={form.role}
            onChange={update('role')}
            error={errors.role}
            disabled={saving}
            hint="Admins can add and deactivate accounts."
            options={OFFICER_ROLES.map((value) => ({ value, label: value }))}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Add officer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
