import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await register(name, email, password)
      navigate('/shop', { replace: true })
    } catch (authError) {
      setError(authError.message || 'Could not register')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="halftone-hero flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="auth-glow panel panel-diagonal w-full max-w-md bg-ink-900/95 p-7 text-ink-100">
      <p className="caption-box bg-brand-accent text-ink-950 border-ink-950">Ironclad Legion</p>
      <h1 className="title-glow mt-4 text-4xl font-semibold">Register</h1>
      {error && <p className="mt-3 text-red-400">{error}</p>}
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          Name
          <input
            className="mt-1 block w-full border-2 border-ink-800 bg-ink-100 p-3 text-ink-950 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            className="mt-1 block w-full border-2 border-ink-800 bg-ink-100 p-3 text-ink-950 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="mt-1 block w-full border-2 border-ink-800 bg-ink-100 p-3 text-ink-950 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p className="mt-5 text-sm text-ink-100/70">
        Already have an account? <Link className="text-brand-accent underline" to="/login">Login</Link>
      </p>
      </div>
    </main>
  )
}

export default Register
