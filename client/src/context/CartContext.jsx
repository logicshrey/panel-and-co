import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'cart'

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY))
    return Array.isArray(savedCart) ? savedCart : []
  } catch {
    return []
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((item) => item.variantId === action.payload.variantId)
      if (existing) {
        return state.map((item) => (
          item.variantId === action.payload.variantId
            ? { ...item, qty: item.qty + action.payload.qty }
            : item
        ))
      }
      return [...state, action.payload]
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.variantId !== action.payload)
    case 'UPDATE_QTY':
      return action.payload.qty < 1
        ? state.filter((item) => item.variantId !== action.payload.variantId)
        : state.map((item) => (
          item.variantId === action.payload.variantId
            ? { ...item, qty: action.payload.qty }
            : item
        ))
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => ({ items, dispatch }), [items])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
