import { useEffect, useRef } from 'react'
import Button from './Button'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    confirmRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onCancel?.()
    }
    document.addEventListener('keydown', onKeyDown)

    // Stop the page behind the dialog from scrolling.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel?.()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded border border-line bg-surface p-5"
      >
        <h2 id="confirm-title" className="text-sm font-medium text-ink">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-xs text-ink-muted">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
