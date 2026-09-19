import { Fragment, useEffect, useState } from 'react'
import client from '../../api/client'
import { getFactions } from '../../api/factions'

const EMPTY_PRODUCT = { name: '', factionId: '', description: '', basePrice: '', images: '' }
const EMPTY_VARIANT = { size: '', color: '', stock: '', sku: '' }
const INPUT_CLASS = 'w-full border border-ink-800 bg-ink-950 px-3 py-2 text-ink-100 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent'
const SECONDARY_BUTTON = 'border border-ink-800 px-3 py-2 text-sm text-ink-100 hover:border-ink-100/60 hover:bg-ink-800'
const DANGER_BUTTON = 'border border-red-800 px-3 py-2 text-sm text-red-300 hover:bg-red-950'

function imageList(value) {
  return value.split(/\n|,/).map((image) => image.trim()).filter(Boolean)
}

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [factions, setFactions] = useState([])
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT)
  const [error, setError] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [uploadStates, setUploadStates] = useState([])

  async function loadProducts() {
    const { data } = await client.get('/admin/products')
    setProducts(data.products)
  }

  useEffect(() => {
    loadProducts().catch(() => setError('Could not load products'))
    getFactions().then(setFactions).catch(() => setError('Could not load factions'))
  }, [])

  function changeProduct(field, value) {
    setProductForm((form) => ({ ...form, [field]: value }))
  }

  function addExternalUrl() {
    const url = externalUrl.trim()
    if (!url) return
    setProductForm((form) => ({ ...form, images: [...imageList(form.images), url].join('\n') }))
    setExternalUrl('')
  }

  async function uploadImages(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const initialStates = files.map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name, status: 'Uploading…' }))
    setUploadStates((current) => [...current, ...initialStates])

    await Promise.all(files.map(async (file) => {
      const id = `${file.name}-${file.lastModified}`
      const formData = new FormData()
      formData.append('image', file)
      try {
        const { data } = await client.post('/admin/upload', formData)
        setProductForm((form) => ({ ...form, images: [...imageList(form.images), data.secure_url].join('\n') }))
        setUploadStates((current) => current.map((upload) => upload.id === id ? { ...upload, status: 'Uploaded', url: data.secure_url } : upload))
      } catch (requestError) {
        setUploadStates((current) => current.map((upload) => upload.id === id ? { ...upload, status: requestError.response?.data?.message || 'Upload failed' } : upload))
      }
    }))
    event.target.value = ''
  }

  async function saveProduct(event) {
    event.preventDefault()
    setError('')
    const payload = { ...productForm, basePrice: Number(productForm.basePrice), images: imageList(productForm.images) }
    try {
      if (editingId) await client.put(`/admin/products/${editingId}`, payload)
      else await client.post('/admin/products', payload)
      setProductForm(EMPTY_PRODUCT)
      setEditingId(null)
      setExternalUrl('')
      setUploadStates([])
      await loadProducts()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save product')
    }
  }

  function beginEdit(product) {
    setEditingId(product._id)
    setProductForm({
      name: product.name,
      factionId: product.factionId?._id || '',
      description: product.description || '',
      basePrice: String(product.basePrice),
      images: product.images?.join('\n') || '',
    })
    setExternalUrl('')
    setUploadStates([])
  }

  async function removeProduct(id) {
    if (!window.confirm('Delete this product and all of its variants?')) return
    await client.delete(`/admin/products/${id}`)
    await loadProducts()
  }

  async function addVariant(productId, event) {
    event.preventDefault()
    try {
      await client.post(`/admin/products/${productId}/variants`, { ...variantForm, stock: Number(variantForm.stock) })
      setVariantForm(EMPTY_VARIANT)
      await loadProducts()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add variant')
    }
  }

  async function updateStock(variant, stock) {
    try {
      await client.put(`/admin/variants/${variant._id}`, { stock: Number(stock) })
      await loadProducts()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update stock')
    }
  }

  async function removeVariant(id) {
    await client.delete(`/admin/variants/${id}`)
    await loadProducts()
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Products</h2>
      {error && <p className="text-red-400">{error}</p>}
      <form className="grid gap-4 border border-ink-800 bg-ink-900 p-5" onSubmit={saveProduct}>
        <h3 className="font-semibold">{editingId ? 'Edit product' : 'Add product'}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">Name<input className={`mt-1 ${INPUT_CLASS}`} value={productForm.name} onChange={(event) => changeProduct('name', event.target.value)} required /></label>
          <label className="text-sm">Faction<select className={`mt-1 ${INPUT_CLASS}`} value={productForm.factionId} onChange={(event) => changeProduct('factionId', event.target.value)} required>
            <option value="">Select faction</option>
            {factions.map((faction) => <option key={faction._id} value={faction._id}>{faction.name}</option>)}
          </select></label>
          <label className="text-sm">Base price<input className={`mt-1 ${INPUT_CLASS}`} type="number" min="0" value={productForm.basePrice} onChange={(event) => changeProduct('basePrice', event.target.value)} required /></label>
          <div className="text-sm"><span>Product images</span><input className="mt-1 block w-full cursor-pointer border border-ink-800 bg-ink-950 p-2 text-sm text-ink-100 file:mr-3 file:border-0 file:bg-brand-accent file:px-3 file:py-1 file:text-sm file:font-semibold file:text-ink-950" type="file" accept="image/*" multiple onChange={uploadImages} /><p className="mt-1 text-xs text-ink-100/55">Upload one or more images (max 10 MB each).</p></div>
          <div className="text-sm"><label htmlFor="external-image-url">External image URL (optional)</label><div className="mt-1 flex gap-2"><input id="external-image-url" className={INPUT_CLASS} placeholder="https://..." value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} /><button className={SECONDARY_BUTTON} type="button" onClick={addExternalUrl}>Add URL</button></div></div>
        </div>
        {(imageList(productForm.images).length > 0 || uploadStates.length > 0) && <div className="flex flex-wrap gap-3">{imageList(productForm.images).map((url) => <div className="w-20" key={url}><img className="h-20 w-20 border border-ink-800 object-cover" src={url} alt="Product upload preview" /></div>)}{uploadStates.filter((upload) => !upload.url).map((upload) => <p className="self-center text-xs text-ink-100/65" key={upload.id}>{upload.name}: {upload.status}</p>)}</div>}
        <label className="text-sm">Description<textarea className={`mt-1 min-h-24 ${INPUT_CLASS}`} value={productForm.description} onChange={(event) => changeProduct('description', event.target.value)} /></label>
        <div className="flex gap-2"><button className="bg-brand-accent px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-accent-dark" type="submit">{editingId ? 'Save product' : 'Add product'}</button>{editingId && <button className={SECONDARY_BUTTON} type="button" onClick={() => { setEditingId(null); setProductForm(EMPTY_PRODUCT) }}>Cancel</button>}</div>
      </form>
      <div className="overflow-x-auto border border-ink-800 bg-ink-900">
        <table className="w-full text-left text-sm"><thead className="bg-ink-800 text-ink-100/75"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Faction</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Variants</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
          <tbody>{products.map((product) => <Fragment key={product._id}>
            <tr key={product._id} className="border-t border-ink-800 hover:bg-ink-800/60"><td className="px-4 py-3">{product.name}</td><td className="px-4 py-3">{product.factionId?.name}</td><td className="px-4 py-3">₹{product.basePrice}</td><td className="px-4 py-3">{product.variants.length}</td><td className="space-x-2 whitespace-nowrap px-4 py-3"><button className={SECONDARY_BUTTON} type="button" onClick={() => setExpandedId(expandedId === product._id ? null : product._id)}>Variants</button><button className={SECONDARY_BUTTON} type="button" onClick={() => beginEdit(product)}>Edit</button><button className={DANGER_BUTTON} type="button" onClick={() => removeProduct(product._id)}>Delete</button></td></tr>
            {expandedId === product._id && <tr key={`${product._id}-variants`}><td colSpan="5" className="border-t border-ink-800 bg-ink-950 p-4"><ul className="space-y-2">{product.variants.map((variant) => <li key={variant._id} className="flex flex-wrap items-center gap-3 border-b border-ink-800 pb-2">{variant.size} / {variant.color} / {variant.sku}<label className="ml-auto text-sm">Stock<input aria-label={`Stock for ${variant.sku}`} className="ml-2 w-20 border border-ink-800 bg-ink-900 px-2 py-1 text-ink-100 outline-none focus:border-brand-accent" type="number" min="0" defaultValue={variant.stock} onBlur={(event) => updateStock(variant, event.target.value)} /></label><button className={DANGER_BUTTON} type="button" onClick={() => removeVariant(variant._id)}>Delete</button></li>)}</ul><form className="mt-4 grid gap-3 md:grid-cols-5" onSubmit={(event) => addVariant(product._id, event)}>{Object.keys(EMPTY_VARIANT).map((field) => <label className="text-sm capitalize" key={field}>{field}<input className={`mt-1 ${INPUT_CLASS}`} placeholder={field} type={field === 'stock' ? 'number' : 'text'} min={field === 'stock' ? '0' : undefined} value={variantForm[field]} onChange={(event) => setVariantForm((form) => ({ ...form, [field]: event.target.value }))} required /></label>)}<div className="self-end"><button className="bg-brand-accent px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-accent-dark" type="submit">Add variant</button></div></form></td></tr>}
          </Fragment>)}</tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminProducts
