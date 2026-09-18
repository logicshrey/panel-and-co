import client from './client'

function toList(value) {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value : [value]
}

export async function getProducts({
  factionSlug,
  category,
  size,
  color,
  minPrice,
  maxPrice,
  sort,
} = {}) {
  const params = new URLSearchParams()

  toList(factionSlug).forEach((slug) => params.append('faction', slug))
  toList(size).forEach((value) => params.append('size', value))
  toList(color).forEach((value) => params.append('color', value))

  if (category) params.set('category', category)
  if (minPrice !== undefined && minPrice !== '') params.set('minPrice', minPrice)
  if (maxPrice !== undefined && maxPrice !== '') params.set('maxPrice', maxPrice)
  if (sort) params.set('sort', sort)

  const { data } = await client.get(`/products?${params.toString()}`)
  return data.products
}

export async function getProductById(id) {
  const { data } = await client.get(`/products/${id}`)
  return data.product
}

export async function getProductFilters() {
  const { data } = await client.get('/products/filters')
  return data
}
