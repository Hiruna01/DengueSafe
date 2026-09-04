const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** One date rendering for the whole app. Missing dates read as an em dash. */
export default function formatDate(value) {
  return value ? dateFormat.format(new Date(value)) : '—'
}
