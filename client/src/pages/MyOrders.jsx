import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

function MyOrders() {
  const { user, loading } = useAuth(); const navigate = useNavigate(); const [orders, setOrders] = useState([]); const [error, setError] = useState('')
  useEffect(() => { if (!loading && !user) navigate('/login', { replace: true, state: { from: { pathname: '/orders' } } }) }, [loading, user, navigate])
  useEffect(() => { if (user) client.get('/orders').then(({ data }) => setOrders(data.orders)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load orders')) }, [user])
  if (loading || !user) return <main className="p-6 text-ink-100/60">Loading orders...</main>
  return <main className="mx-auto max-w-4xl p-6 text-ink-100"><h1 className="text-3xl font-semibold">My orders</h1>{error && <p className="mt-4 text-red-400">{error}</p>}{!error && orders.length === 0 && <p className="mt-4 text-ink-100/60">You have not placed an order yet.</p>}<ul className="mt-5 space-y-3">{orders.map((order) => <li key={order._id}><Link className="block border border-ink-800 bg-ink-900 p-4 hover:border-brand-accent" to={`/orders/${order._id}`}><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">Order {order._id}</span><span className="capitalize text-brand-accent">{order.status}</span></div><p className="mt-1 text-sm text-ink-100/65">{new Date(order.createdAt).toLocaleString()} · {order.items.length} item(s) · ₹{order.total}</p></Link></li>)}</ul></main>
}

export default MyOrders
