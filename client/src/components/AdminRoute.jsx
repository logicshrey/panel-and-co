import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-4">Loading...</p>
  if (user?.role !== 'admin') return <Navigate to="/shop" replace />
  return <Outlet />
}

export default AdminRoute
