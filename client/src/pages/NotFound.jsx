import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2">The page you requested does not exist.</p>
      <Link className="mt-4 inline-block" to="/">Back to home</Link>
    </main>
  )
}

export default NotFound
