import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../api/sessions'

const SessionContext = createContext(null)
const keyFor = (code) => `shoptogether:${code.toUpperCase()}`

export function SessionProvider({ children }) {
  const [state, setState] = useState({ code: '', session: null, members: [], cart: [], myMemberId: '', loading: false, ended: false })
  const apply = useCallback((code, data, memberId) => setState((current) => ({ ...current, code, session: data.session, members: data.members, cart: data.cart, myMemberId: memberId || current.myMemberId, loading: false, ended: false })), [])
  const load = useCallback(async (code, memberId) => {
    setState((current) => ({ ...current, code, myMemberId: memberId || current.myMemberId, loading: true }))
    try { const data = await api.getSession(code); apply(code, data, memberId) } catch (error) { setState((current) => ({ ...current, loading: false, ended: error.response?.status === 410, error: error.response?.status === 404 ? 'not-found' : 'error' })); throw error }
  }, [apply])
  const join = useCallback(async (code, displayName) => { const data = await api.joinSession(code, displayName); localStorage.setItem(keyFor(code), data.member._id); apply(code, data, data.member._id); return data }, [apply])
  useEffect(() => {
    if (!state.code || !state.myMemberId || state.ended) return undefined
    const tick = async () => { try { await api.pingSession(state.code, state.myMemberId); const data = await api.getSession(state.code); apply(state.code, data, state.myMemberId) } catch (error) { if (error.response?.status === 410) setState((current) => ({ ...current, ended: true, loading: false })) } }
    const id = window.setInterval(tick, 3000); return () => window.clearInterval(id)
  }, [state.code, state.myMemberId, state.ended, apply])
  const mutate = async (request) => { const data = await request(); apply(state.code, data, state.myMemberId); return data }
  const value = useMemo(() => ({ ...state, load, join, activate: (code, data, memberId) => { localStorage.setItem(keyFor(code), memberId); apply(code, data, memberId) }, storedMemberId: (code) => localStorage.getItem(keyFor(code)), addToSharedCart: (variantId, qty) => mutate(() => api.addSessionCartItem(state.code, { memberId: state.myMemberId, variantId, qty })), updateSharedCartQty: (id, qty) => mutate(() => api.updateSessionCartItem(state.code, id, qty)), removeSharedCartItem: (id) => mutate(() => api.deleteSessionCartItem(state.code, id)), endSession: async (code = state.code) => { await api.endShopSession(code); setState((current) => ({ ...current, ended: true, session: current.session ? { ...current.session, active: false } : null })) }, leaveSession: () => { if (state.code) localStorage.removeItem(keyFor(state.code)); setState({ code: '', session: null, members: [], cart: [], myMemberId: '', loading: false, ended: false }) } }), [state, load, join, apply])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useShopTogether() { const value = useContext(SessionContext); if (!value) throw new Error('useShopTogether must be used within SessionProvider'); return value }
