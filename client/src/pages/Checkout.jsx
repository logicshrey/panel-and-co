import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { endShopSession, getSession } from '../api/sessions'

const INITIAL_ADDRESS = { line1: '', line2: '', city: '', state: '', pincode: '', phone: '' }

function Checkout() {
  const { user, loading } = useAuth()
  const { items, dispatch } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [address, setAddress] = useState(INITIAL_ADDRESS)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const sessionCode = new URLSearchParams(location.search).get('session')
  const [sharedState, setSharedState] = useState(null)
  const [sessionReady, setSessionReady] = useState(!sessionCode)
  const checkoutItems = sessionCode
    ? (sharedState?.cart || []).map((item) => ({ variantId: item.variantId._id, qty: item.qty, name: item.variantId.productId.name, price: item.variantId.productId.basePrice }))
    : items
  const subtotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0), [checkoutItems])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true, state: { from: { pathname: location.pathname } } })
    }
  }, [loading, user, navigate, location.pathname])

  useEffect(() => {
    if (!sessionCode || !user) return
    getSession(sessionCode).then((data) => {
      if (String(data.session.hostUserId) !== String(user.id || user._id)) navigate(`/shop-together/${sessionCode}`, { replace: true })
      else setSharedState(data)
    }).catch(() => navigate(`/shop-together/${sessionCode}`, { replace: true })).finally(() => setSessionReady(true))
  }, [sessionCode, user, navigate])

  if (loading || !user || !sessionReady) return <p className="p-6 text-ink-100/60">Loading...</p>

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const requiredFields = ['line1', 'city', 'state', 'pincode', 'phone']
    if (checkoutItems.length === 0) {
      setError('Your cart is empty')
      return
    }
    if (requiredFields.some((field) => !address[field].trim())) {
      setError('Please complete all required address fields')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const { data } = await client.post('/orders', {
        items: checkoutItems.map((item) => ({ variantId: item.variantId, qty: item.qty })),
        address,
      })
      await client.post(`/orders/${data.order._id}/confirm`)
      if (sessionCode) await endShopSession(sessionCode)
      else dispatch({ type: 'CLEAR_CART' })
      navigate(`/order-confirmation/${data.order._id}`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not place your order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 p-6 text-ink-100 md:grid-cols-2">
      <section className="border-2 border-ink-800 bg-ink-900 p-5">
        <h1 className="font-poster text-4xl">Checkout</h1>
        {error && <p className="mt-3 text-red-400">{error}</p>}
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {Object.entries(INITIAL_ADDRESS).map(([field]) => (
            <label key={field} className="block text-sm font-medium">
              {field === 'line1' ? 'Address line 1' : field === 'line2' ? 'Address line 2 (optional)' : field}
              <input
                className="mt-1 block w-full border-2 border-ink-800 bg-ink-100 p-2 text-ink-950"
                value={address[field]}
                onChange={(event) => updateAddress(field, event.target.value)}
                required={field !== 'line2'}
              />
            </label>
          ))}
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={submitting || checkoutItems.length === 0}>
            {submitting ? 'Processing…' : 'Pay Now'}
          </button>
        </form>
      </section>
      <aside className="h-fit border-2 border-ink-800 bg-ink-900 p-5">
        <h2 className="font-caption text-xl">Order summary</h2>
        <ul className="mt-4 space-y-2">
          {checkoutItems.map((item) => <li className="border-b border-ink-800 pb-2" key={item.variantId}>{item.name} × {item.qty} — ₹{item.price * item.qty}</li>)}
        </ul>
        <p className="mt-4">Subtotal: ₹{subtotal}</p>
        <p>Shipping: Free</p>
        <p className="font-semibold">Total: <span className="text-brand-accent">₹{subtotal}</span></p>
      </aside>
    </main>
  )
}

export default Checkout
