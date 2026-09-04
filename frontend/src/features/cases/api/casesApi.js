import client from '../../../api/client'

const RESOURCE = '/cases'

export const AGE_BANDS = ['Under15', 'Age15To30', 'Age31To50', 'Over50']

export const AGE_BAND_LABELS = {
  Under15: 'Under 15',
  Age15To30: '15–30',
  Age31To50: '31–50',
  Over50: 'Over 50',
}

export const SEVERITIES = ['DF', 'DHF']

export const SEVERITY_LABELS = {
  DF: 'DF (dengue fever)',
  DHF: 'DHF (haemorrhagic)',
}

export const ageBandLabel = (band) => AGE_BAND_LABELS[band] ?? band
export const severityLabel = (severity) => SEVERITY_LABELS[severity] ?? severity

function toParams(query = {}) {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) acc[key] = value
    return acc
  }, {})
}

export const getCases = (query) => client.get(RESOURCE, { params: toParams(query) })

export const createCase = (payload) => client.post(RESOURCE, payload)
