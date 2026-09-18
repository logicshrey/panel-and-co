import client from './client'

export async function getAnalyticsSummary() {
  const { data } = await client.get('/admin/analytics/summary')
  return data
}

export async function getRevenue(days = 30) {
  const { data } = await client.get('/admin/analytics/revenue', { params: { days } })
  return data.revenue
}

export async function getBestSellers() {
  const { data } = await client.get('/admin/analytics/best-sellers')
  return data
}

export async function getLowStock(threshold = 5) {
  const { data } = await client.get('/admin/analytics/low-stock', { params: { threshold } })
  return data.items
}
