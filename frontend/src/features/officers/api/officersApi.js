import client from '../../../api/client'

const RESOURCE = '/officers'

export const OFFICER_ROLES = ['Admin', 'Officer']

export const ACTIVE_FILTERS = [
  { value: 'true', label: 'Active only' },
  { value: 'false', label: 'Deactivated only' },
]

/** Drops empty filters so the API doesn't receive `?search=&role=`. */
function toParams(query = {}) {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) acc[key] = value
    return acc
  }, {})
}

export const getOfficers = (query) => client.get(RESOURCE, { params: toParams(query) })

export const createOfficer = (payload) => client.post(RESOURCE, payload)

export const updateOfficer = (id, payload) => client.put(`${RESOURCE}/${id}`, payload)

export const setOfficerActive = (id, isActive) =>
  client.patch(`${RESOURCE}/${id}/active`, { isActive })
