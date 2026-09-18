import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../api/sessions'
import { useAuth } from '../context/AuthContext'
import { useShopTogether } from '../context/SessionContext'

export default function ShopTogetherStart() {
  const { user } = useAuth(); const together = useShopTogether(); const navigate = useNavigate(); const [code, setCode] = useState(''); const [error, setError] = useState('')
  async function start() { try { const data = await createSession(); together.activate(data.session.code, data, data.members[0]._id); navigate(`/shop-together/${data.session.code}`) } catch { setError('Could not start a session') } }
  function go(event) { event.preventDefault(); if (code.trim()) navigate(`/shop-together/${code.trim().toUpperCase()}`) }
  return <main className="mx-auto max-w-md space-y-5 p-4"><h1 className="text-2xl font-semibold">Shop Together</h1>{user ? <button className="border px-4 py-2" onClick={start}>Start a session</button> : <p>Log in to start a session.</p>}<form className="space-y-2" onSubmit={go}><label className="block">Join with code<input className="mt-1 block w-full border p-2" value={code} onChange={(e) => setCode(e.target.value)} /></label><button className="border px-4 py-2">Join session</button></form>{error && <p>{error}</p>}</main>
}
