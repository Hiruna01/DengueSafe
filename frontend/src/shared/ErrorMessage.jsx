import Button from './Button'

export default function ErrorMessage({ message, onRetry, className = '' }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-between gap-3 rounded border border-danger/25 bg-danger-soft px-4 py-3 ${className}`}
    >
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
