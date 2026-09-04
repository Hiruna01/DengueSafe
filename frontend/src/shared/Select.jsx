import Field, { controlClasses } from './Field'

export default function Select({
  id,
  label,
  error,
  hint,
  required,
  options = [],
  placeholder,
  className = '',
  ...props
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className={`${controlClasses(Boolean(error))} appearance-none pr-8 ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%236b6a65' stroke-width='1.5' d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.6rem center',
          backgroundSize: '0.75rem',
        }}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const label_ = typeof option === 'string' ? option : option.label
          return (
            <option key={value} value={value}>
              {label_}
            </option>
          )
        })}
      </select>
    </Field>
  )
}
