import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import OrderTracker from '../components/OrderTracker'

function OrderDetail() {
  const { id } = useParams(); const { user, loading } = useAuth(); const navigate = useNavigate(); const [order, setOrder] = useState(null); const [error, setError] = useState('')
  useEffect(() => { if (!loading && !user) navigate('/login', { replace: true, state: { from: { pathname: `/orders/${id}` } } }) }, [loading, user, navigate, id])
  useEffect(() => { if (user) client.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load order')) }, [id, user])
  if (loading || !user || !order) return <main className="p-6 text-ink-100/60">{error || 'Loading order...'}</main>
  return <main className="mx-auto max-w-3xl p-6 text-ink-100"><Link className="text-sm text-brand-accent" to="/orders">← My orders</Link><h1 className="mt-4 text-3xl font-semibold">Order details</h1><p className="mt-2 text-ink-100/65">Order ID: {order._id}</p><p className="mt-1">Payment: {order.paymentMethod || 'COD'}</p><OrderTracker status={order.status} paymentMethod={order.paymentMethod || 'COD'} /><ul className="mt-6 space-y-2 border-t border-ink-800 pt-4">{order.items.map((item) => <li key={item._id}>{item.variantId?.productId?.name || 'Product'} — {item.variantId?.size} / {item.variantId?.color} × {item.qty} — ₹{item.price * item.qty}</li>)}</ul><p className="mt-4 font-semibold">Total: ₹{order.total}</p></main>
}

export default OrderDetail
