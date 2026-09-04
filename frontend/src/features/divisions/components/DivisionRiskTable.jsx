import { RiskBadge } from '../../../shared'

/** The scored divisions, worst first. Shared by the risk board and dashboard. */
export default function DivisionRiskTable({ divisions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[38rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Division</th>
            <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">MOH area</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-muted">Vector risk</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-muted">Open</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-muted">Cases (14d)</th>
            <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Band</th>
          </tr>
        </thead>
        <tbody>
          {divisions.map((division) => (
            <tr key={division.id} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{division.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{division.recommendedAction}</p>
              </td>
              <td className="px-4 py-3 text-xs text-ink-muted">
                {division.mohArea}
                <span className="block text-ink-subtle">{division.district}</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink">
                {division.vectorRisk.toFixed(1)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                {division.openReportCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                {division.recentCaseCount}
              </td>
              <td className="px-4 py-3">
                <RiskBadge band={division.riskBand} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
