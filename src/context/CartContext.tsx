/**
 * CartProvider con Sistema de Notificaciones de Alto Impacto.
 * Implementa validaciones de negocio (donaciones, límites globales y de boletos gratuitos)
 * y UI de alerta premium.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { CartItem, Tier } from '../types'
import { CONFIG } from '../config'

const STRIPE_MAX_CENTS = 99999900; 

interface CartContextValue {
  items: CartItem[]
  totalCents: number
  totalItems: number
  toast: { message: string; show: boolean; type: 'error' | 'info' }
  addItem: (tier: Tier, quantity: number, donationAmount?: number) => void
  removeItem: (tierId: string) => void
  updateQuantity: (tierId: string, quantity: number) => void
  updateDonation: (tierId: string, amount: number) => void
  clearCart: () => void
  hideToast: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('MT_CART_SESSION');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState({ message: '', show: false, type: 'error' as const });

  const triggerAlert = (message: string) => {
    setToast({ message, show: true, type: 'error' });
    // Vibración haptica si el dispositivo lo permite
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    localStorage.setItem('MT_CART_SESSION', JSON.stringify(items));
  }, [items]);

  // Se calcula el total respetando las donaciones y los boletos de precio fijo
  const totalCents = items.reduce((sum, i) => {
    const itemPrice = i.tier.type === 'DONATION' ? (i.donationAmount || i.tier.min_donation_amount) : i.tier.price_amount;
    return sum + (itemPrice * i.quantity);
  }, 0);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const addItem = useCallback((tier: Tier, quantity: number, donationAmount?: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.tier.id === tier.id)
      
      // Validación 1: Límite Global de Boletos
      const potentialGlobalTotal = prev.reduce((sum, i) => sum + i.quantity, 0) + quantity;
      if (potentialGlobalTotal > CONFIG.MAX_TICKETS_PER_ORDER) {
        triggerAlert(`¡Límite alcanzado! Máximo ${CONFIG.MAX_TICKETS_PER_ORDER} boletos por orden.`);
        return prev;
      }

      // 🔥 Validación 2: Límite específico para boletos GRATIS
      if (tier.type === 'FREE') {
        const currentFreeCount = prev.reduce((sum, i) => i.tier.type === 'FREE' ? sum + i.quantity : sum, 0);
        if (currentFreeCount + quantity > CONFIG.MAX_FREE_TICKETS) {
          triggerAlert(`Solo puedes pedir hasta ${CONFIG.MAX_FREE_TICKETS} boleto(s) gratis por orden.`);
          return prev;
        }
      }

      // Validación 3: Límite de monto máximo para Stripe
      const priceToAdd = tier.type === 'DONATION' ? (donationAmount || tier.min_donation_amount) : tier.price_amount;
      if (totalCents + (priceToAdd * quantity) > STRIPE_MAX_CENTS) {
        triggerAlert("Monto máximo excedido. Por seguridad, reduce la cantidad.");
        return prev;
      }

      // Cálculos de inventario y agregar
      const availableStock = tier.stock_total - tier.stock_sold;
      const newQty = Math.min((existing?.quantity || 0) + quantity, CONFIG.MAX_TICKETS_PER_ORDER, availableStock);

      if (existing) {
          return prev.map((i) => (i.tier.id === tier.id ? { ...i, quantity: newQty, donationAmount: donationAmount || i.donationAmount } : i));
      }
      return [...prev, { tier, quantity: newQty, donationAmount: donationAmount || (tier.type === 'DONATION' ? tier.min_donation_amount : 0) }];
    })
  }, [totalCents])

  const updateQuantity = useCallback((tierId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.tier.id !== tierId);
      const item = prev.find(i => i.tier.id === tierId);
      if (!item) return prev;

      // 🔥 Validación 1: Límite específico para boletos GRATIS al actualizar desde los botones + y -
      if (item.tier.type === 'FREE') {
        // Sumamos los gratis de otros tiers (por si el evento tiene varios tipos de boletos gratis)
        const otherFreeCount = prev.reduce((sum, i) => (i.tier.type === 'FREE' && i.tier.id !== tierId) ? sum + i.quantity : sum, 0);
        if (otherFreeCount + quantity > CONFIG.MAX_FREE_TICKETS) {
          triggerAlert(`Solo puedes pedir hasta ${CONFIG.MAX_FREE_TICKETS} boleto(s) gratis por orden.`);
          return prev;
        }
      }

      // Validación 2: Límite de Stripe
      const itemPrice = item.tier.type === 'DONATION' ? (item.donationAmount || item.tier.min_donation_amount) : item.tier.price_amount;
      if (totalCents + (itemPrice * (quantity - item.quantity)) > STRIPE_MAX_CENTS) {
        triggerAlert("Límite de pago alcanzado.");
        return prev;
      }

      // Validación 3: Límite Global
      const newGlobal = prev.reduce((sum, i) => sum + (i.tier.id === tierId ? quantity : i.quantity), 0);
      if (newGlobal > CONFIG.MAX_TICKETS_PER_ORDER) {
        triggerAlert(`Solo puedes comprar hasta ${CONFIG.MAX_TICKETS_PER_ORDER} boletos.`);
        return prev;
      }

      return prev.map((i) => i.tier.id === tierId ? { ...i, quantity: Math.min(quantity, i.tier.stock_total - i.tier.stock_sold) } : i);
    })
  }, [totalCents])

  const updateDonation = useCallback((tierId: string, amount: number) => {
      setItems(prev => prev.map(item => {
          if (item.tier.id === tierId) {
              const validAmount = Math.max(amount, item.tier.min_donation_amount);
              return { ...item, donationAmount: validAmount };
          }
          return item;
      }));
  }, []);

  const removeItem = (id: string) => setItems(p => p.filter(i => i.tier.id !== id));
  const clearCart = () => { setItems([]); localStorage.removeItem('MT_CART_SESSION'); };
  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  return (
    <CartContext.Provider value={{ items, totalCents, totalItems, toast, addItem, removeItem, updateQuantity, updateDonation, clearCart, hideToast }}>
      {children}
      
      {/* ── ALERTA DE IMPACTO ── */}
      <div 
        className={`fixed-top d-flex justify-content-center pt-4 px-3 ${toast.show ? 'v-show' : 'v-hide'}`}
        style={{ zIndex: 9999, pointerEvents: 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        <div 
          className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-lg border-start border-4 border-danger"
          style={{ 
            pointerEvents: 'auto',
            background: '#1a1a1a', 
            minWidth: '320px',
            maxWidth: '90vw',
            color: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
             <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-0 fw-bold small text-danger">ATENCIÓN</h6>
            <p className="mb-0 small opacity-75">{toast.message}</p>
          </div>
          <button onClick={hideToast} className="btn-close btn-close-white small opacity-50"></button>
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
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}