import Button from './Button'

export default function Pagination({ page, pageSize, totalCount, totalPages, onPageChange }) {
  if (!totalCount) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalCount)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5"
    >
      <p className="text-xs text-ink-muted">
        {first}–{last} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span className="px-1 text-xs text-ink-muted tabular-nums">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
