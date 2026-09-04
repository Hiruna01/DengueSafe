import client from '../../../api/client'

const RESOURCE = '/auth'

/** Exchanges credentials for a token. Rejects with a normalised error object. */
export const login = (email, password) => client.post(`${RESOURCE}/login`, { email, password })

/** Confirms a stored token still works, and returns who it belongs to. */
export const getCurrentOfficer = () => client.get(`${RESOURCE}/me`)
