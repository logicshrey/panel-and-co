import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../api/products'
import { useCart } from '../context/CartContext'

function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('loading')
  const [added, setAdded] = useState(false)
  const { dispatch } = useCart()

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setSelectedId('')

    getProductById(id)
      .then((data) => {
        if (cancelled) return
        setProduct(data)
        setSelectedId(data.variants?.[0]?._id || '')
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const selected = product?.variants?.find((variant) => variant._id === selectedId)

  function addToCart() {
    if (!selected) return

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        variantId: selected._id,
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        size: selected.size,
        color: selected.color,
        price: product.basePrice,
        qty: 1,
      },
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  if (status === 'loading') return <p className="p-6 text-ink-100/60">Loading...</p>
  if (status === 'error' || !product) return <p className="p-6 text-ink-100/60">Product not found</p>

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-ink-100">
      <p className="font-caption text-sm text-brand-accent">
        <Link to="/shop">← Back to shop</Link>
      </p>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div className="panel panel-diagonal bg-ink-900 p-3">
        {product.images?.map((src) => (
          <img className="w-full object-cover" key={src} src={src} alt={product.name} />
        ))}
        </div>

        <section className="space-y-5">
          <span className="caption-box">{product.factionId?.name}</span>
          <h1 className="font-poster text-5xl">{product.name}</h1>
          <p className="text-ink-100/75">{product.description}</p>
          <p className="font-caption text-2xl text-brand-accent">₹{product.basePrice}</p>

          <label className="block max-w-sm font-semibold">
        Variant
        <select
          className="mt-2 block w-full border-2 border-ink-950 bg-ink-100 p-3 text-ink-950"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {product.variants?.map((variant) => (
            <option key={variant._id} value={variant._id}>
              {variant.size} / {variant.color} — stock {variant.stock}
            </option>
          ))}
        </select>
          </label>

          <ul className="space-y-1 text-sm text-ink-100/65">
        {product.variants?.map((variant) => (
          <li key={variant._id}>
            {variant.size} / {variant.color} — {variant.stock} in stock
          </li>
        ))}
          </ul>

          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={addToCart} disabled={!selected || selected.stock < 1}>
        Add to cart
          </button>
          {added && <p className="font-caption text-sm text-brand-accent">Added to cart</p>}
        </section>
      </div>
    </main>
  )
}

export default Product
