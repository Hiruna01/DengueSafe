import Field, { controlClasses } from './Field'

export default function Textarea({
  id,
  label,
  error,
  hint,
  required,
  rows = 5,
  className = '',
  ...props
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={`${controlClasses(Boolean(error))} resize-y ${className}`}
        {...props}
      />
    </Field>
  )
}
