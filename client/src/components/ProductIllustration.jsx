import { useId } from 'react'

const FACTION_COLORS = {
  aetherguard: { primary: '#0EA5E9', accent: '#C0C0C0' },
  'ironclad-core': { primary: '#DC2626', accent: '#1F2937' },
  nightspire: { primary: '#581C87', accent: '#FCD34D' },
}

function inferGarmentType(name = '') {
  const value = name.toLowerCase()
  if (value.includes('hoodie')) return 'hoodie'
  if (value.includes('cap') || value.includes('hat')) return 'cap'
  if (value.includes('crew') || value.includes('sweatshirt')) return 'crew'
  return 'tee'
}

function Emblem({ factionSlug, accentColor }) {
  if (factionSlug === 'ironclad-core') return <path d="M92 100 108 91l16 9v19l-16 13-16-13Z M108 98v25 M97 108h22" fill="none" stroke={accentColor} strokeWidth="4" strokeLinejoin="round" />
  if (factionSlug === 'nightspire') return <path d="M117 92a22 22 0 1 0 14 39 24 24 0 1 1-14-39Zm-17 27 8-14 8 14-8 11Z" fill={accentColor} />
  return <path d="m91 119 15-24 4 16 17-11-12 25-5-15-19 9Zm18-24 2 16" fill="none" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
}

function ProductIllustration({ garmentType, factionSlug, primaryColor, accentColor, name = '', className = '' }) {
  const id = useId().replace(/:/g, '')
  const type = garmentType || inferGarmentType(name)
  const colors = FACTION_COLORS[factionSlug] || FACTION_COLORS.aetherguard
  const primary = primaryColor || colors.primary
  const accent = accentColor || colors.accent
  const gradientId = `garment-gradient-${id}`
  const shadowId = `garment-shadow-${id}`

  const garment = type === 'cap' ? <><path d="M55 120c0-40 25-65 59-65 39 0 66 28 66 66v10H55Z" fill={`url(#${gradientId})`} /><path d="M48 129h142c-5 18-23 26-54 26H72c-13 0-22-9-24-26Z" fill={accent} opacity=".85" /><path d="M72 118c18-14 44-18 70-14M82 65c17 2 30 14 34 33" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="4" strokeLinecap="round" /><g transform="translate(2 22)"><Emblem factionSlug={factionSlug} accentColor={accent} /></g></> : type === 'hoodie' ? <><path d="m76 74 21-19h23l22 19 38 18-16 44-19-7v81H72v-81l-19 7-16-44Z" fill={`url(#${gradientId})`} /><path d="M92 79c2-19 10-29 17-29s16 10 18 29l-17 13Z" fill="none" stroke={accent} strokeWidth="5" strokeLinejoin="round" /><path d="M91 157h38l10 25H81Z" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" /><path d="m73 204 20-13m52 13-20-13" stroke="rgba(0,0,0,.35)" strokeWidth="5" /><Emblem factionSlug={factionSlug} accentColor={accent} /></> : <><path d="m76 77 23-20h22l23 20 37 17-16 43-20-8v80H72v-80l-20 8-16-43Z" fill={`url(#${gradientId})`} />{type === 'crew' && <path d="M96 60c1 14 8 21 14 21s13-7 14-21" fill="none" stroke={accent} strokeWidth="5" />}<path d="M91 78c12 8 25 8 38 0" fill="none" stroke="rgba(255,255,255,.26)" strokeWidth="4" strokeLinecap="round" /><path d="m72 204 21-13m52 13-21-13" stroke="rgba(0,0,0,.3)" strokeWidth="5" /><Emblem factionSlug={factionSlug} accentColor={accent} /></>

  return <svg className={`product-illustration ${className}`} viewBox="0 0 220 240" role="img" aria-label={`${name || 'Faction'} ${type} illustration`}><defs><linearGradient id={gradientId} x1="45" y1="52" x2="176" y2="210" gradientUnits="userSpaceOnUse"><stop stopColor={primary} /><stop offset=".58" stopColor={primary} stopOpacity=".8" /><stop offset="1" stopColor={accent} stopOpacity=".72" /></linearGradient><filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity=".45" /></filter></defs><ellipse cx="110" cy="218" rx="62" ry="10" fill="#000" opacity=".28" /><g filter={`url(#${shadowId})`}>{garment}</g></svg>
}

export default ProductIllustration
