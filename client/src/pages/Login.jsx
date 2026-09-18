import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const loggedInUser = await login(email, password)
      const returnPath = location.state?.from?.pathname
      const destination = returnPath || (loggedInUser.role === 'admin' ? '/admin' : '/shop')
      navigate(destination, { replace: true })
    } catch (authError) {
      setError(authError.message || 'Invalid credentials')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          Email
          <input
            className="mt-1 block w-full border p-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block">
          Password
          <input
            className="mt-1 block w-full border p-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="border px-4 py-2" type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p className="mt-4">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </main>
  )
}

export default Login
