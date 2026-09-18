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
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Register</h1>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          Name
          <input
            className="mt-1 block w-full border p-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
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
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p className="mt-4">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  )
}

export default Register
