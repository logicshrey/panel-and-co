import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { SessionProvider } from './context/SessionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <SessionProvider><BrowserRouter><App /></BrowserRouter></SessionProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
