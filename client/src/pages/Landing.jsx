import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFactions } from '../api/factions'
import { getProducts } from '../api/products'
import HalftoneHero from '../components/HalftoneHero'
import FactionCard from '../components/FactionCard'
import ProductIllustration from '../components/ProductIllustration'

const FEATURES = [
  { icon: '✦', title: 'AI Shopping Assistant', text: 'Ask naturally for real catalog picks, faction style guidance, and price-aware recommendations.' },
  { icon: '◌', title: 'Shop Together', text: 'Start a shared shopping session, invite your crew, and build one live cart together.' },
  { icon: '▣', title: 'Secure Checkout', text: 'Choose Cash on Delivery or Razorpay-powered UPI and card payment for your order.' },
  { icon: '→', title: 'Order Tracking', text: 'Follow every order from pending through delivery with a clear live-status timeline.' },
]

function RevealSection({ children, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.14 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return <section ref={ref} className={`reveal-section ${visible ? 'is-revealed' : ''} ${className}`}>{children}</section>
}

export default function Landing() {
  const [factions, setFactions] = useState([])
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    getFactions().then(setFactions).catch(() => setFactions([]))
    getProducts().then((products) => setFeatured(products.slice(0, 4))).catch(() => setFeatured([]))
  }, [])

  return (
    <main>
      <HalftoneHero />
      <RevealSection className="mx-auto max-w-6xl px-4 py-20">
        <p className="caption-box">Recruitment dossier</p>
        <h2 className="title-glow mb-7 mt-3 font-poster text-4xl text-ink-100">Choose Your Faction</h2>
        <div className="grid gap-6 sm:grid-cols-3">{factions.map((faction) => <FactionCard key={faction._id} faction={faction} />)}</div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-6xl px-4 py-10">
        <div className="max-w-2xl"><p className="caption-box">The panel advantage</p><h2 className="title-glow mt-3 font-poster text-4xl">Why Panel &amp; Co.</h2><p className="mt-3 text-ink-100/70">A faction-first storefront built for more than a one-click purchase.</p></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{FEATURES.map((feature) => <article key={feature.title} className="panel ink-hover min-h-52 bg-ink-900 p-5"><span className="relative z-10 text-3xl text-brand-accent">{feature.icon}</span><h3 className="relative z-10 mt-6 text-xl font-semibold">{feature.title}</h3><p className="relative z-10 mt-3 text-sm leading-6 text-ink-100/70">{feature.text}</p></article>)}</div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="caption-box">Fresh from the vault</p><h2 className="title-glow mt-3 font-poster text-4xl">Featured Drops</h2></div><Link className="font-caption text-sm text-brand-accent hover:text-ink-100" to="/shop">View all products →</Link></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <Link key={product._id} to={`/product/${product._id}`} className="panel ink-hover group block bg-ink-900 p-3"><ProductIllustration name={product.name} factionSlug={product.factionId?.slug} className="relative z-10 aspect-square w-full" /><p className="relative z-10 mt-3 text-xs text-ink-100/55">{product.factionId?.name}</p><h3 className="relative z-10 mt-1 text-lg font-semibold">{product.name}</h3><span className="caption-box relative z-10 mt-3 bg-brand-accent text-ink-950 border-ink-950">₹{product.basePrice}</span></Link>)}</div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-6xl px-4 pb-20"><section className="panel panel-diagonal halftone-hero bg-ink-900 px-8 py-14 text-center md:px-16"><p className="caption-box">Your story starts here</p><h2 className="cinematic-title mt-5 font-poster text-5xl md:text-7xl">Pick a faction. Make it yours.</h2><p className="mx-auto mt-4 max-w-xl text-ink-100/70">Explore the catalog, find your signal, and wear a piece of the Panel &amp; Co. universe.</p><Link className="btn-primary mt-7" to="/shop">Shop Now</Link></section></RevealSection>
    </main>
  )
}
