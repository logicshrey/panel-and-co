import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getFactions } from '../api/factions'
import { getProductFilters, getProducts } from '../api/products'
import ProductMedia from '../components/ProductMedia'

function toggleValue(params, key, value) {
  const next = new URLSearchParams(params)
  const current = next.getAll(key)
  next.delete(key)
  const updated = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
  updated.forEach((item) => next.append(key, item))
  return next
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [factions, setFactions] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({ sizes: [], colors: [] })
  const [status, setStatus] = useState('loading')

  const factionSlug = searchParams.getAll('faction')
  const size = searchParams.getAll('size')
  const color = searchParams.getAll('color')
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || ''

  const query = useMemo(
    () => ({ factionSlug, category, size, color, minPrice, maxPrice, sort }),
    [factionSlug.join(','), category, size.join(','), color.join(','), minPrice, maxPrice, sort],
  )

  useEffect(() => {
    getFactions().then(setFactions).catch(() => setFactions([]))
    getProductFilters().then(setFilters).catch(() => setFilters({ sizes: [], colors: [] }))
  }, [])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getProducts(query)
      .then((data) => {
        if (cancelled) return
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [query])

  function onToggle(key, value) {
    setSearchParams(toggleValue(searchParams, key, value), { replace: true })
  }

  return (
    <div className="flex min-h-screen gap-8 bg-ink-950 px-6 py-10 text-ink-100">
      <aside className="panel h-fit w-56 shrink-0 bg-ink-900 p-4 text-ink-100/80">
        <h2 className="mb-4 font-poster text-2xl text-ink-100">Filters</h2>

        <fieldset className="border-t border-ink-800 pt-3">
          <legend className="mb-2 font-caption text-xs text-ink-100/55">
            Faction
          </legend>
          {factions.map((faction) => (
            <label key={faction._id} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={factionSlug.includes(faction.slug)}
                onChange={() => onToggle('faction', faction.slug)}
                className="accent-brand-accent"
              />
              {faction.name}
            </label>
          ))}
        </fieldset>

        <fieldset className="mt-4 border-t border-ink-800 pt-3">
          <legend className="mb-2 font-caption text-xs text-ink-100/55">
            Size
          </legend>
          {filters.sizes.map((value) => (
            <label key={value} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={size.includes(value)}
                onChange={() => onToggle('size', value)}
                className="accent-brand-accent"
              />
              {value}
            </label>
          ))}
        </fieldset>

        <fieldset className="mt-4 border-t border-ink-800 pt-3">
          <legend className="mb-2 font-caption text-xs text-ink-100/55">
            Color
          </legend>
          {filters.colors.map((value) => (
            <label key={value} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={color.includes(value)}
                onChange={() => onToggle('color', value)}
                className="accent-brand-accent"
              />
              {value}
            </label>
          ))}
        </fieldset>
      </aside>

      <section className="flex-1">
        {status === 'loading' && <p className="text-ink-100/60">Loading...</p>}
        {status === 'error' && <p className="text-red-400">Could not load products.</p>}
        {status === 'ready' && products.length === 0 && (
          <p className="text-ink-100/60">No products found</p>
        )}

        {status === 'ready' && products.length > 0 && (
          <ul className="grid grid-cols-3 gap-4">
            {products.map((product) => (
              <li key={product._id}>
                <Link
                  to={`/product/${product._id}`}
                  className="panel ink-hover group block bg-ink-900 p-3 transition-transform hover:-translate-y-1"
                >
                  <ProductMedia
                    imageUrl={product.images?.[0]}
                    name={product.name}
                    factionSlug={product.factionId?.slug}
                    className="relative z-10 aspect-square w-full"
                    imageClassName="relative z-10 aspect-square w-full object-cover"
                  />
                  <p className="relative z-10 mt-3 text-sm text-ink-100/60">
                    {product.factionId?.name}
                  </p>
                  <h4 className="relative z-10 mt-1 text-lg text-ink-100">{product.name}</h4>
                  <span className="caption-box relative z-10 mt-3 bg-brand-accent text-ink-950 border-ink-950">₹{product.basePrice}</span>
                  {product.variants?.length > 0 && (
                    <p className="relative z-10 mt-3 text-xs text-ink-100/60">
                      {[...new Set(product.variants.map((variant) => variant.size))].join(' · ')}
                      {' — '}
                      {[...new Set(product.variants.map((variant) => variant.color))].join(' · ')}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Shop
