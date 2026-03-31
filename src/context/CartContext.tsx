/**
 * CartProvider Contextual (Multi-Evento).
 * Cada evento mantiene su propio carrito independiente en el storage.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import type { CartItem, Tier } from '@/types'
import { CONFIG } from '@/config'

const STRIPE_MAX_CENTS = 99999900

// 🔥 Tipo multi-evento
type MultiEventCart = Record<string, CartItem[]>

interface CartContextValue {
  items: CartItem[]
  totalCents: number
  totalItems: number
  cartMap: MultiEventCart
  toast: { message: string; show: boolean; type: 'error' | 'info' }

  addItem: (
  tier: Tier,
  quantity: number,
  event_id: string,
  project_id: string,
  event_name: string, // 👈 nuevo
  event_poster?: string, // 👈 nuevo
  donationAmount?: number,
  currency?: string
) => void

  removeItem: (tierId: string) => void
  updateQuantity: (tierId: string, quantity: number) => void
  updateDonation: (tierId: string, amount: number) => void
  clearCart: () => void
  hideToast: () => void
  removeEventCart: (eventId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  // 🧠 Estado global
  const [cartMap, setCartMap] = useState<MultiEventCart>(() => {
    const saved = localStorage.getItem('MT_MULTI_CART')
    return saved ? JSON.parse(saved) : {}
  })

  const [toast, setToast] = useState({
    message: '',
    show: false,
    type: 'error' as const,
  })

  // 🎯 Evento activo
  const [activeEventId, setActiveEventId] = useState<string | null>(
    sessionStorage.getItem('current_event_id')
  )

  // 🔄 Sync sessionStorage
  useEffect(() => {
    const sync = () => {
      setActiveEventId(sessionStorage.getItem('current_event_id'))
    }

    window.addEventListener('storage', sync)
    const interval = setInterval(sync, 1000)

    return () => {
      window.removeEventListener('storage', sync)
      clearInterval(interval)
    }
  }, [])

  // 💾 Persistencia
  useEffect(() => {
    localStorage.setItem('MT_MULTI_CART', JSON.stringify(cartMap))
  }, [cartMap])

  // 🎟️ Items del evento activo
  const items = useMemo(() => {
    return activeEventId ? cartMap[activeEventId] || [] : []
  }, [cartMap, activeEventId])

  // ⚠️ Toast
  const triggerAlert = (message: string) => {
    setToast({ message, show: true, type: 'error' })
    if (navigator.vibrate) navigator.vibrate(50)

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 4000)
  }

  // 💰 Totales
  const totalCents = items.reduce((sum, i) => {
    const price =
      i.tier.type === 'DONATION'
        ? i.donationAmount || i.tier.min_donation_amount
        : i.tier.price_amount

    return sum + price * i.quantity
  }, 0)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // ➕ Agregar
const addItem = useCallback((
  tier: Tier,
  quantity: number,
  event_id: string,
  project_id: string,
  event_name: string,
  event_poster?: string,
  donationAmount?: number,
  currency: string = 'MXN'
) => {
      setCartMap((prev) => {
        const currentItems = prev[event_id] || []
        const existing = currentItems.find((i) => i.tier.id === tier.id)

        const currentTotal = currentItems.reduce((s, i) => s + i.quantity, 0)

        if (currentTotal + quantity > CONFIG.MAX_TICKETS_PER_ORDER) {
          triggerAlert(
            `Límite de ${CONFIG.MAX_TICKETS_PER_ORDER} boletos alcanzado`
          )
          return prev
        }

        if (tier.type === 'FREE') {
          const freeCount = currentItems.reduce(
            (s, i) => (i.tier.type === 'FREE' ? s + i.quantity : s),
            0
          )

          if (freeCount + quantity > CONFIG.MAX_FREE_TICKETS) {
            triggerAlert(
              `Máximo ${CONFIG.MAX_FREE_TICKETS} cortesías`
            )
            return prev
          }
        }

        const available = tier.stock_total - tier.stock_sold
        const newQty = Math.min(
          (existing?.quantity || 0) + quantity,
          CONFIG.MAX_TICKETS_PER_ORDER,
          available
        )

        let newItems

        if (existing) {
          newItems = currentItems.map((i) =>
            i.tier.id === tier.id
              ? {
                  ...i,
                  quantity: newQty,
                  event_name: existing.event_name || event_name,
                  event_poster: existing.event_poster || event_poster,
                  donationAmount:
                    donationAmount || i.donationAmount,
                }
              : i
          )
        } else {
          newItems = [
            ...currentItems,
            {
              tier,
              quantity: newQty,
              donationAmount:
                donationAmount ||
                (tier.type === 'DONATION'
                  ? tier.min_donation_amount
                  : 0),
              currency,
              project_id,
              event_id,
               event_name,
              event_poster
            },
          ]
        }

        return { ...prev, [event_id]: newItems }
      })
    },
    []
  )

  // 🔄 Update qty
  const updateQuantity = useCallback(
    (tierId: string, quantity: number) => {
      if (!activeEventId) return

      setCartMap((prev) => {
        const current = prev[activeEventId] || []

        if (quantity <= 0) {
          return {
            ...prev,
            [activeEventId]: current.filter(
              (i) => i.tier.id !== tierId
            ),
          }
        }

        return {
          ...prev,
          [activeEventId]: current.map((i) =>
            i.tier.id === tierId
              ? {
                  ...i,
                  quantity: Math.min(
                    quantity,
                    i.tier.stock_total - i.tier.stock_sold,
                    CONFIG.MAX_TICKETS_PER_ORDER
                  ),
                }
              : i
          ),
        }
      })
    },
    [activeEventId]
  )

  // 💸 Donation
  const updateDonation = useCallback(
    (tierId: string, amount: number) => {
      if (!activeEventId) return

      setCartMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).map((i) =>
          i.tier.id === tierId
            ? {
                ...i,
                donationAmount: Math.max(
                  amount,
                  i.tier.min_donation_amount
                ),
              }
            : i
        ),
      }))
    },
    [activeEventId]
  )

  // ❌ Remove
  const removeItem = (tierId: string) => {
    if (!activeEventId) return

    setCartMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).filter(
        (i) => i.tier.id !== tierId
      ),
    }))
  }

  const removeEventCart = useCallback((eventId: string) => {
  setCartMap((prev) => {
    const copy = { ...prev }
    delete copy[eventId]
    return copy
  })
}, [])

  // 🧹 Clear
  const clearCart = () => {
    if (!activeEventId) return

    setCartMap((prev) => {
      const copy = { ...prev }
      delete copy[activeEventId]
      return copy
    })
  }

  const hideToast = () =>
    setToast((prev) => ({ ...prev, show: false }))

  // ✅ RETURN CORRECTO (esto te faltaba)
  return (
    <CartContext.Provider
      value={{
        items,
        totalCents,
        totalItems,
        cartMap, // 🔥 CLAVE
        toast,
        addItem,
        removeItem,
        updateQuantity,
        updateDonation,
        clearCart,
        removeEventCart,
        hideToast,
      }}
    >
      {children}

      {/* 🔥 Toast */}
      <div
        className={`fixed-top d-flex justify-content-center pt-4 px-3 ${
          toast.show ? 'v-show' : 'v-hide'
        }`}
        style={{
          zIndex: 9999,
          pointerEvents: 'none',
          transition: 'all 0.4s',
        }}
      >
        <div
          className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-lg border-start border-4 border-danger"
          style={{
            pointerEvents: 'auto',
            background: '#1a1a1a',
            minWidth: '320px',
            color: '#fff',
          }}
        >
          <div
            className="bg-danger rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
          >
            ⚠️
          </div>

          <div>
            <h6 className="mb-0 fw-bold small text-danger">
              ERROR
            </h6>
            <p className="mb-0 small opacity-75">
              {toast.message}
            </p>
          </div>

          <button
            onClick={hideToast}
            className="btn-close btn-close-white ms-auto"
          />
        </div>
      </div>

      <style>{`
        .v-show { transform: translateY(0); opacity: 1; }
        .v-hide { transform: translateY(-100px); opacity: 0; }
      `}</style>
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx)
    throw new Error('useCart must be used within CartProvider')
  return ctx
}