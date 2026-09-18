import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const { items, dispatch } = useCart()
  const navigate = useNavigate()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-6 text-ink-100">
        <p className="text-lg">Your cart is empty</p>
        <Link className="mt-3 inline-block font-caption text-sm text-brand-accent" to="/shop">Back to shop</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl p-6 text-ink-100">
      <h1 className="font-poster text-4xl">Cart</h1>
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 border-2 border-ink-800 bg-ink-900 p-4">
            {item.image && <img className="h-24 w-24 object-cover" src={item.image} alt={item.name} />}
            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-sm text-ink-100/65">{item.size} / {item.color}</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="border border-ink-100/40 px-2" type="button" onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { variantId: item.variantId, qty: item.qty - 1 } })}>−</button>
                <span className="min-w-5 text-center">{item.qty}</span>
                <button className="border border-ink-100/40 px-2" type="button" onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { variantId: item.variantId, qty: item.qty + 1 } })}>+</button>
                <button className="ml-2 text-sm text-brand-accent underline" type="button" onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.variantId })}>Remove</button>
              </div>
            </div>
            <p className="font-semibold">₹{item.price * item.qty}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-lg font-semibold">Subtotal: <span className="text-brand-accent">₹{subtotal}</span></p>
      <button className="btn-primary mt-4" type="button" onClick={() => navigate('/checkout')}>
        Proceed to checkout
      </button>
    </main>
  )
}

export default Cart
