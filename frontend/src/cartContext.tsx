import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CartItem {
  product_id: string
  name: string
  image_url: string
  price: number
  size: string
  quantity: number
}

export interface Celebration {
  name: string
  nonce: number // changes each add, so repeat adds re-trigger the animation
}

interface CartState {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (product_id: string, size: string, quantity: number) => void
  remove: (product_id: string, size: string) => void
  clear: () => void
  celebration: Celebration | null
  clearCelebration: () => void
}

const STORAGE_KEY = 'cc_cart'
const CartContext = createContext<CartState | null>(null)
const keyOf = (id: string, size: string) => `${id}__${size}`

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  const [celebration, setCelebration] = useState<Celebration | null>(null)

  // Persist the cart so it survives reloads (per browser, like a guest cart).
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo<CartState>(() => {
    const add: CartState['add'] = (item, quantity = 1) => {
      setItems((cur) => {
        const existing = cur.find((c) => keyOf(c.product_id, c.size) === keyOf(item.product_id, item.size))
        if (existing) {
          return cur.map((c) =>
            c === existing ? { ...c, quantity: Math.min(25, c.quantity + quantity) } : c,
          )
        }
        return [...cur, { ...item, quantity }]
      })
      // Tell the UI to let Handsome Dan celebrate the add.
      setCelebration({ name: item.name, nonce: Date.now() })
    }

    const setQuantity: CartState['setQuantity'] = (product_id, size, quantity) =>
      setItems((cur) =>
        cur
          .map((c) =>
            c.product_id === product_id && c.size === size
              ? { ...c, quantity: Math.max(0, Math.min(25, quantity)) }
              : c,
          )
          .filter((c) => c.quantity > 0),
      )

    const remove: CartState['remove'] = (product_id, size) =>
      setItems((cur) => cur.filter((c) => !(c.product_id === product_id && c.size === size)))

    return {
      items,
      count: items.reduce((n, c) => n + c.quantity, 0),
      subtotal: items.reduce((s, c) => s + c.price * c.quantity, 0),
      add,
      setQuantity,
      remove,
      clear: () => setItems([]),
      celebration,
      clearCelebration: () => setCelebration(null),
    }
  }, [items, celebration])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
