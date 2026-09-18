import client from './client'

export const createSession = () => client.post('/sessions').then(({ data }) => data)
export const getSession = (code) => client.get(`/sessions/${code}`).then(({ data }) => data)
export const joinSession = (code, displayName) => client.post(`/sessions/${code}/join`, { displayName }).then(({ data }) => data)
export const pingSession = (code, memberId) => client.post(`/sessions/${code}/ping`, { memberId }).then(({ data }) => data)
export const addSessionCartItem = (code, payload) => client.post(`/sessions/${code}/cart`, payload).then(({ data }) => data)
export const updateSessionCartItem = (code, itemId, qty) => client.put(`/sessions/${code}/cart/${itemId}`, { qty }).then(({ data }) => data)
export const deleteSessionCartItem = (code, itemId) => client.delete(`/sessions/${code}/cart/${itemId}`).then(({ data }) => data)
export const endShopSession = (code) => client.post(`/sessions/${code}/end`).then(({ data }) => data)
