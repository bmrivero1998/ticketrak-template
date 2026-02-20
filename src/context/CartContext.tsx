import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CartItem, Tier } from '@/types'
import { CONFIG } from '@/config'

interface CartContextValue {
  items: CartItem[]
  totalCents: number
  totalItems: number
  addItem: (tier: Tier, quantity: number) => void
  removeItem: (tierId: string) => void
  updateQuantity: (tierId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * Provides the cart state and actions to update it.
 *
 * This context is used to share the cart state across the application.
 * It provides the following values and actions:
 * - `items`: an array of `CartItem` objects representing the items in the cart.
 * - `totalCents`: the total cost of the items in the cart in cents.
 * - `totalItems`: the total number of items in the cart.
 * - `addItem`: a function to add a new item to the cart.
 * - `removeItem`: a function to remove an item from the cart.
 * - `updateQuantity`: a function to update the quantity of an item in the cart.
 * - `clearCart`: a function to clear the cart.
 * The cart state is managed using the `useState` hook, and the actions are memoized using the `useCallback` hook to prevent unnecessary re-renders.
 *  The `CartProvider` component should wrap the part of the application that needs access to the cart state, and the `useCart` hook can be used to access the cart context in any child component.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const totalCents = items.reduce((sum, i) => sum + i.tier.price_amount * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const addItem = useCallback((tier: Tier, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.tier.id === tier.id)
      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          CONFIG.MAX_TICKETS_PER_ORDER,
          tier.stock_total-tier.stock_sold,
        )
        return prev.map((i) => (i.tier.id === tier.id ? { ...i, quantity: newQty } : i))
      }
      return [
        ...prev,
        {
          tier,
          quantity: Math.min(quantity, CONFIG.MAX_TICKETS_PER_ORDER, tier.stock_total-tier.stock_sold),
        },
      ]
    })
  }, [])

  const removeItem = useCallback((tierId: string) => {
    setItems((prev) => prev.filter((i) => i.tier.id !== tierId))
  }, [])

  const updateQuantity = useCallback((tierId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.tier.id !== tierId))
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.tier.id === tierId
            ? { ...i, quantity: Math.min(quantity, CONFIG.MAX_TICKETS_PER_ORDER, i.tier.stock_total-i.tier.stock_sold) }
            : i,
        ),
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  return (
    <CartContext.Provider
      value={{ items, totalCents, totalItems, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
