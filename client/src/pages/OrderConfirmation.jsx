import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'

function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load order'))
  }, [id])

  if (error) return <main className="p-4"><p>{error}</p></main>
  if (!order) return <main className="p-4"><p>Loading order...</p></main>

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-semibold">Order confirmed</h1>
      <p className="mt-2">Order ID: {order._id}</p>
      <p>Status: {order.status === 'paid' ? 'Paid' : order.status}</p>
      <ul className="mt-4 space-y-2">
        {order.items.map((item) => (
          <li key={item._id}>
            {item.variantId?.productId?.name || 'Product'} — {item.variantId?.size} / {item.variantId?.color} × {item.qty} — ₹{item.price * item.qty}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold">Total: ₹{order.total}</p>
      <Link className="mt-4 inline-block" to="/shop">Continue shopping</Link>
    </main>
  )
}

export default OrderConfirmation
