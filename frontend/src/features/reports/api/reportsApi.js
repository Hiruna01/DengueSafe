import client from '../../../api/client'

const RESOURCE = '/reports'

/*
  Site types a member of the public can pick. PremisesInspection is omitted on
  purpose: the backend raises those itself when a case is notified, and they
  are not something anyone reports by hand.
*/
export const SITE_TYPES = [
  'DiscardedTyres',
  'WaterStorageTank',
  'ConstructionSite',
  'RoofGutter',
  'PlantPotSaucer',
  'OrnamentalPond',
]

export const SITE_TYPE_LABELS = {
  DiscardedTyres: 'Discarded tyres',
  WaterStorageTank: 'Water storage tank',
  ConstructionSite: 'Construction site',
  RoofGutter: 'Roof gutter',
  PlantPotSaucer: 'Plant pot saucer',
  OrnamentalPond: 'Ornamental pond',
  PremisesInspection: 'Premises inspection',
}

export const siteTypeLabel = (siteType) => SITE_TYPE_LABELS[siteType] ?? siteType

/*
  Mirrors RiskService.AgeingThresholdDays: past 7 days — the Aedes aegypti
  egg-to-adult cycle — an open report has had time to produce a new generation,
  and the backend starts multiplying its score. Used here only to mark those
  rows in the queue; the scoring itself stays entirely on the backend.
*/
export const AGEING_THRESHOLD_DAYS = 7

/** Whether a report has been standing long enough to be flagged in the queue. */
export const isAgeing = (report) => report.daysOpen > AGEING_THRESHOLD_DAYS

/** The statuses an officer can move a report to. Nothing moves back to Reported. */
export const UPDATABLE_STATUSES = ['Inspected', 'Cleared', 'NoticeIssued']

/** Drops empty filters so the API doesn't receive `?search=&status=`. */
function toParams(query = {}) {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) acc[key] = value
    return acc
  }, {})
}

export const getReports = (query) => client.get(RESOURCE, { params: toParams(query) })

export const getReport = (id) => client.get(`${RESOURCE}/${id}`)

export const createReport = (payload) => client.post(RESOURCE, payload)

export const updateStatus = (id, status, inspectorNote) =>
  client.patch(`${RESOURCE}/${id}/status`, { status, inspectorNote })

/*
  There is no sign-in, so "my reports" is a lookup by the number the report was
  filed under: the resident types it back in and gets their own submissions.
  The last number used is remembered on this device so submitting a report
  leads straight to a filled-in lookup — it is deliberately kept out of the URL
  so a shared or bookmarked link never carries somebody's phone number.
*/
const MY_PHONE_KEY = 'dengue.myReportPhone'

export function getRememberedPhone() {
  try {
    const stored = localStorage.getItem(MY_PHONE_KEY)
    return typeof stored === 'string' ? stored : ''
  } catch {
    return ''
  }
}

export function rememberPhone(phone) {
  try {
    localStorage.setItem(MY_PHONE_KEY, phone)
  } catch {
    // A browser with storage disabled just re-types the number next time.
  }
}

/**
 * Every report filed from one number, newest first. The API orders by risk
 * score for the inspection queue; a resident following their own submissions
 * wants the most recent one at the top instead.
 */
export async function getReportsByPhone(phone) {
  // A dedicated anonymous endpoint: GET /reports itself is the officer queue
  // and now requires a token.
  const result = await client.get(`${RESOURCE}/by-phone`, {
    params: { phone, pageSize: 100 },
  })
  const items = result?.items ?? []

  return [...items].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
}
