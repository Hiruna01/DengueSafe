import Field, { controlClasses } from './Field'

export default function Input({ id, label, error, hint, required, className = '', ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className={`${controlClasses(Boolean(error))} ${className}`}
        {...props}
      />
    </Field>
  )
}
