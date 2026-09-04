import { Fragment } from 'react'
import { Badge, StatusBadge } from '../../../shared'
import { isAgeing, siteTypeLabel } from '../api/reportsApi'
import ReportDetailPanel from './ReportDetailPanel'

const COLUMNS = ['Risk', 'Site type', 'Division', 'Landmark', 'Days open', 'Status', '']

/** The days-open cell, flagged once a report has been standing too long. */
function DaysOpen({ report }) {
  if (!isAgeing(report)) {
    return <span className="tabular-nums text-ink-muted">{report.daysOpen}d</span>
  }

  return (
    <Badge tone="danger" className="tabular-nums">
      {report.daysOpen}d ageing
    </Badge>
  )
}

/** Left edge marker, so an ageing row is scannable without reading the column. */
const edgeClass = (report) =>
  isAgeing(report) ? 'border-l-2 border-l-danger' : 'border-l-2 border-l-transparent'

/*
  The queue, in whichever shape fits: a table from md up, cards below it. Both
  render the same expandable detail panel, so an officer works the same way on a
  phone in the field as at a desk.
*/
export default function InspectionQueueList({ reports, expandedId, onToggle, onUpdated }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Reports ordered by risk score, highest first. Rows expand for detail.
          </caption>
          <thead>
            <tr className="border-b border-line text-left">
              {COLUMNS.map((column, index) => (
                <th
                  key={column || 'expand'}
                  scope="col"
                  className={`px-4 py-2.5 text-xs font-medium text-ink-muted ${
                    index === 0 || index === 4 ? 'text-right' : ''
                  }`}
                >
                  {column || <span className="sr-only">Expand</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const expanded = expandedId === report.id

              return (
                <Fragment key={report.id}>
                  <tr
                    className={`border-b border-line align-top ${
                      expanded ? 'bg-canvas' : 'last:border-0'
                    }`}
                  >
                    <td className={`py-3 pr-4 pl-3.5 text-right ${edgeClass(report)}`}>
                      <span className="tabular-nums text-ink">{report.riskScore.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onToggle(report.id)}
                        aria-expanded={expanded}
                        className="text-left font-medium text-ink hover:text-accent"
                      >
                        {siteTypeLabel(report.siteType)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{report.divisionName}</td>
                    <td className="max-w-xs px-4 py-3 text-ink-muted">{report.landmark || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <DaysOpen report={report} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onToggle(report.id)}
                        aria-expanded={expanded}
                        className="text-xs whitespace-nowrap text-accent hover:underline"
                      >
                        {expanded ? 'Close' : 'Open'}
                      </button>
                    </td>
                  </tr>

                  {/*
                    The panel spans every column in a row of its own directly
                    beneath, so it opens where the officer clicked rather than at
                    the foot of the table.
                  */}
                  {expanded && (
                    <tr className="border-b border-line last:border-0">
                      <td colSpan={COLUMNS.length} className="p-0">
                        <ReportDetailPanel report={report} onUpdated={onUpdated} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:hidden">
        {reports.map((report) => {
          const expanded = expandedId === report.id

          return (
            <article
              key={report.id}
              className={`border-b border-line last:border-b-0 ${edgeClass(report)}`}
            >
              <button
                type="button"
                onClick={() => onToggle(report.id)}
                aria-expanded={expanded}
                className="flex w-full flex-col gap-2 px-4 py-3.5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-ink">
                      {siteTypeLabel(report.siteType)}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-muted">{report.divisionName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg tabular-nums text-ink">{report.riskScore.toFixed(1)}</p>
                    <p className="text-xs text-ink-subtle">risk</p>
                  </div>
                </div>

                {report.landmark && (
                  <p className="text-xs text-ink-subtle">{report.landmark}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <DaysOpen report={report} />
                  <span className="ml-auto text-xs text-accent">
                    {expanded ? 'Close' : 'Open'}
                  </span>
                </div>
              </button>

              {expanded && <ReportDetailPanel report={report} onUpdated={onUpdated} />}
            </article>
          )
        })}
      </div>
    </>
  )
}
