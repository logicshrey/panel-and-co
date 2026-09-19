import { Link, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Product from './pages/Product'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderDetail from './pages/OrderDetail'
import MyOrders from './pages/MyOrders'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import NotFound from './pages/NotFound'
import ShopTogetherStart from './pages/ShopTogetherStart'
import ShopTogetherSession from './pages/ShopTogetherSession'
import { useAuth } from './context/AuthContext'
import AssistantChat from './components/AssistantChat'
import Footer from './components/Footer'

function App() {
  const { user, loading, logout } = useAuth()

  return (
    <div className="min-h-screen bg-ink-950 p-4">
      <nav className="nav-cinematic mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 pb-4 text-sm text-ink-100/75">
        <Link className="wordmark-glow font-poster text-3xl tracking-wide text-ink-100" to="/">Panel &amp; Co.</Link>
        <Link className="hover:text-brand-accent" to="/shop">Shop</Link>
        <Link className="hover:text-brand-accent" to="/cart">Cart</Link>
        <Link className="hover:text-brand-accent" to="/shop-together">Shop Together</Link>
        {!loading && !user && (
          <>
            <Link className="font-caption text-xs hover:text-brand-accent" to="/login">Login</Link>
            <Link className="font-caption text-xs hover:text-brand-accent" to="/register">Register</Link>
          </>
        )}
        {!loading && user && (
          <>
            <span className="ml-auto text-ink-100">{user.name}</span>
            <Link className="font-caption text-xs hover:text-brand-accent" to="/orders">My Orders</Link>
            {user.role === 'admin' && <Link className="font-caption text-xs text-brand-accent hover:text-ink-100" to="/admin">Admin</Link>}
            <button className="font-caption text-xs hover:text-brand-accent" type="button" onClick={logout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/shop-together" element={<ShopTogetherStart />} />
        <Route path="/shop-together/:code" element={<ShopTogetherSession />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <AssistantChat />
    </div>
  )
}

export default App
