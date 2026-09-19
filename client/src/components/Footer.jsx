import { Link, useLocation } from 'react-router-dom'

function Footer() {
  const location = useLocation()

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) return null

  return (
    <footer className="mt-16 border-t border-ink-800 bg-ink-900/70 px-6 py-10 text-sm text-ink-100/65">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <section>
          <Link className="font-poster text-3xl text-ink-100" to="/">Panel &amp; Co.</Link>
          <p className="mt-3 max-w-xs leading-6">Wear the story. Choose your faction. Build your legend.</p>
        </section>
        <section>
          <h2 className="font-caption text-xs text-ink-100">Explore</h2>
          <nav className="mt-3 flex flex-col gap-2">
            <Link className="hover:text-brand-accent" to="/shop">Shop</Link>
            <Link className="hover:text-brand-accent" to="/cart">Cart</Link>
            <Link className="hover:text-brand-accent" to="/shop-together">Shop Together</Link>
            <Link className="hover:text-brand-accent" to="/orders">My Orders</Link>
          </nav>
        </section>
        <section>
          <h2 className="font-caption text-xs text-ink-100">Factions</h2>
          <nav className="mt-3 flex flex-col gap-2">
            <Link className="hover:text-aetherguard-primary" to="/shop?faction=aetherguard">Aetherguard</Link>
            <Link className="hover:text-ironclad-primary" to="/shop?faction=ironclad-core">Ironclad Core</Link>
            <Link className="hover:text-nightspire-secondary" to="/shop?faction=nightspire">Nightspire</Link>
          </nav>
        </section>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-ink-800 pt-5 text-xs text-ink-100/45">
        <p>© 2026 Panel &amp; Co. All rights reserved.</p>
        <p className="mt-2">Made with ❤️ and ☕</p>
      </div>
    </footer>
  )
}

export default Footer
