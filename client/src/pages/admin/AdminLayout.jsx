import { Link, Outlet, useLocation } from 'react-router-dom'

function AdminLayout() {
  const location = useLocation()
  const navClass = (path) => `rounded px-3 py-2 text-sm transition-colors ${
    location.pathname === path ? 'bg-brand-accent text-ink-950' : 'text-ink-100/70 hover:bg-ink-800 hover:text-ink-100'
  }`

  return (
    <div className="flex gap-6 text-ink-100">
      <aside className="h-fit w-48 shrink-0 border border-ink-800 bg-ink-900 p-4">
        <h1 className="text-xl font-semibold">Admin</h1>
        <nav className="mt-5 flex flex-col gap-1">
          <Link className={navClass('/admin')} to="/admin">Dashboard</Link>
          <Link className={navClass('/admin/products')} to="/admin/products">Products</Link>
          <Link className={navClass('/admin/orders')} to="/admin/orders">Orders</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1"><Outlet /></main>
    </div>
  )
}

export default AdminLayout
