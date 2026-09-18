import client from './client'

export async function getFactions() {
  const { data } = await client.get('/factions')
  return data.factions
}

export async function getFactionBySlug(slug) {
  const { data } = await client.get(`/factions/${slug}`)
  return data.faction
}
