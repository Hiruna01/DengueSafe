import client from '../../../api/client'

const RESOURCE = '/divisions'

/** Every division, scored and banded, worst first. */
export const getDivisionRisk = () => client.get(RESOURCE)

/** Totals, band breakdown, top site types and the scored divisions in one call. */
export const getDashboard = () => client.get(`${RESOURCE}/dashboard`)

/*
  Presentation ordering shared by the risk board and the landing preview: worst
  band first, then the heavier vector risk inside a band. The banding itself is
  the backend's — this only decides what a reader sees at the top.
*/
const BAND_ORDER = ['Emergency', 'Prevent', 'Investigate', 'Monitor']

const bandRank = (band) => {
  const index = BAND_ORDER.indexOf(band)
  return index === -1 ? BAND_ORDER.length : index
}

export function orderByBand(divisions = []) {
  return [...divisions].sort(
    (a, b) =>
      bandRank(a.riskBand) - bandRank(b.riskBand) ||
      b.vectorRisk - a.vectorRisk ||
      b.recentCaseCount - a.recentCaseCount,
  )
}
