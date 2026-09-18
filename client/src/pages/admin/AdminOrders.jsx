import { useEffect, useState } from 'react'
import client from '../../api/client'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
const SELECT_CLASS = 'border border-ink-800 bg-ink-950 px-3 py-2 text-sm text-ink-100 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  async function loadOrders() {
    const { data } = await client.get('/admin/orders')
    setOrders(data.orders)
  }

  useEffect(() => { loadOrders().catch(() => setError('Could not load orders')) }, [])

  async function setStatus(id, status) {
    try {
      const { data } = await client.put(`/admin/orders/${id}/status`, { status })
      setOrders((current) => current.map((order) => order._id === id ? { ...order, status: data.order.status } : order))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update order status')
    }
  }

  return <section className="space-y-4"><h2 className="text-2xl font-semibold">Orders</h2>{error && <p className="text-red-400">{error}</p>}<div className="overflow-x-auto border border-ink-800 bg-ink-900"><table className="w-full text-left text-sm"><thead className="bg-ink-800 text-ink-100/75"><tr><th className="px-4 py-3 font-medium">Order ID</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Created</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id} className="border-t border-ink-800 hover:bg-ink-800/60"><td className="px-4 py-3 font-mono text-xs">{order._id}</td><td className="px-4 py-3">{order.userId?.name}<br /><span className="text-ink-100/60">{order.userId?.email}</span></td><td className="px-4 py-3">₹{order.total}</td><td className="px-4 py-3"><select className={SELECT_CLASS} value={order.status} onChange={(event) => setStatus(order._id, event.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td><td className="whitespace-nowrap px-4 py-3 text-ink-100/70">{new Date(order.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></section>
}

export default AdminOrders
