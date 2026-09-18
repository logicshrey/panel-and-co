import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function hydrateUser() {
      if (!token) {
        if (active) setLoading(false)
        return
      }

      try {
        const { data } = await client.get('/auth/me')
        if (active) setUser(data.user)
      } catch {
        localStorage.removeItem('token')
        if (active) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    hydrateUser()
    return () => {
      active = false
    }
  }, [token])

  async function authenticate(path, payload) {
    try {
      const { data } = await client.post(path, payload)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Authentication failed'))
    }
  }

  function login(email, password) {
    return authenticate('/auth/login', { email, password })
  }

  function register(name, email, password) {
    return authenticate('/auth/register', { name, email, password })
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setLoading(false)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
