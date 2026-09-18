import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getAnalyticsSummary,
  getBestSellers,
  getLowStock,
  getRevenue,
} from '../../api/analytics'

function stockClass(stock) {
  if (stock < 3) return 'font-semibold text-red-400'
  return 'font-semibold text-amber-300'
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [bestSellers, setBestSellers] = useState({ factions: [], topProducts: [] })
  const [lowStock, setLowStock] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getAnalyticsSummary(),
      getRevenue(30),
      getBestSellers(),
      getLowStock(5),
    ])
      .then(([summaryData, revenueData, sellersData, lowStockData]) => {
        if (cancelled) return
        setSummary(summaryData)
        setRevenue(revenueData)
        setBestSellers(sellersData)
        setLowStock(lowStockData)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load analytics')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const revenueAllZero =
    revenue.length > 0 && revenue.every((row) => row.revenue === 0 && row.orderCount === 0)

  if (status === 'loading') return <p className="text-ink-100/60">Loading...</p>
  if (status === 'error') return <p className="text-red-400">{error}</p>

  return (
    <section className="space-y-8 text-ink-100">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <article className="border border-ink-800 bg-ink-900 p-4">
          <p className="text-sm text-ink-100/65">Total Revenue</p>
          <p className="text-2xl font-semibold">₹{summary.totalRevenue}</p>
        </article>
        <article className="border border-ink-800 bg-ink-900 p-4">
          <p className="text-sm text-ink-100/65">Total Orders</p>
          <p className="text-2xl font-semibold">{summary.totalOrders}</p>
        </article>
        <article className="border border-ink-800 bg-ink-900 p-4">
          <p className="text-sm text-ink-100/65">Pending Orders</p>
          <p className="text-2xl font-semibold">{summary.totalPendingOrders}</p>
        </article>
        <article className="border border-ink-800 bg-ink-900 p-4">
          <p className="text-sm text-ink-100/65">Low Stock Items</p>
          <p className="text-2xl font-semibold">{summary.totalLowStockCount}</p>
        </article>
      </div>

      <div className="border border-ink-800 bg-ink-900 p-5">
        <h3 className="mb-3 text-lg font-semibold">Revenue (30 days)</h3>
        {revenueAllZero ? (
          <p className="text-ink-100/60">No orders yet</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid stroke="#3A3A44" strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={24} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#F6C515" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="border border-ink-800 bg-ink-900 p-5">
        <h3 className="mb-3 text-lg font-semibold">Best-selling factions</h3>
        {bestSellers.factions.length === 0 ? (
          <p className="text-ink-100/60">No orders yet</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers.factions}>
                <CartesianGrid stroke="#3A3A44" strokeDasharray="3 3" />
                <XAxis dataKey="factionName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalRevenue" fill="#F6C515" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <h4 className="mb-2 mt-6 font-semibold">Top products</h4>
        {bestSellers.topProducts.length === 0 ? (
          <p className="text-ink-100/60">No orders yet</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-800 text-ink-100/65">
              <tr>
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Faction</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.topProducts.map((product) => (
                <tr key={product.productId} className="border-t border-ink-800 hover:bg-ink-800/60">
                  <td className="py-3">{product.productName}</td>
                  <td className="py-3">{product.factionName}</td>
                  <td className="py-3">{product.totalQtySold}</td>
                  <td className="py-3">₹{product.totalRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border border-ink-800 bg-ink-900 p-5">
        <h3 className="mb-3 text-lg font-semibold">Low-stock alerts</h3>
        {lowStock.length === 0 ? (
          <p className="text-ink-100/60">No low-stock items</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-800 text-ink-100/65">
              <tr>
                <th className="py-2 font-medium">SKU</th>
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Faction</th>
                <th className="py-2 font-medium">Size</th>
                <th className="py-2 font-medium">Color</th>
                <th className="py-2 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((item) => (
                <tr key={item.variantId} className="border-t border-ink-800 hover:bg-ink-800/60">
                  <td className="py-3">{item.sku}</td>
                  <td className="py-3">{item.productName}</td>
                  <td className="py-3">{item.factionName}</td>
                  <td className="py-3">{item.size}</td>
                  <td className="py-3">{item.color}</td>
                  <td className={`py-3 ${stockClass(item.stock)}`}>{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default AdminDashboard
