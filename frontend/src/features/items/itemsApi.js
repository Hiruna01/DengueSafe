import client from '../../api/client'

const RESOURCE = '/items'

export const ITEM_STATUSES = ['Pending', 'InProgress', 'Completed', 'Rejected']
export const PRIORITIES = ['Low', 'Medium', 'High']

export const STATUS_LABELS = {
  Pending: 'Pending',
  InProgress: 'In progress',
  Completed: 'Completed',
  Rejected: 'Rejected',
}

/** Drops empty filters so the API doesn't receive `?search=&status=`. */
function toParams(query = {}) {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) acc[key] = value
    return acc
  }, {})
}

export const getItems = (query) => client.get(RESOURCE, { params: toParams(query) })

export const getItem = (id) => client.get(`${RESOURCE}/${id}`)

export const createItem = (payload) => client.post(RESOURCE, payload)

export const updateItem = (id, payload) => client.put(`${RESOURCE}/${id}`, payload)

export const updateItemStatus = (id, status) =>
  client.patch(`${RESOURCE}/${id}/status`, { status })

export const deleteItem = (id) => client.delete(`${RESOURCE}/${id}`)
