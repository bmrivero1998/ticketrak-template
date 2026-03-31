import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { TicketVaultModal } from '../TicketVaultModal'
import { FiShoppingCart } from 'react-icons/fi'

export function Header() {
  const { cartMap } = useCart()
  const [open, setOpen] = useState(false)

  // 🔥 Conteo real multi-evento
  const { totalItems, totalEvents } = useMemo(() => {
    const events = Object.keys(cartMap)

    const items = Object.values(cartMap).reduce(
      (sum, arr) => sum + arr.reduce((s, i) => s + i.quantity, 0),
      0
    )

    return {
      totalItems: items,
      totalEvents: events.length,
    }
  }, [cartMap])

  return (
    <>
      <header
        className="w-100 position-sticky top-0"
        style={{
          zIndex: 1200,
          backdropFilter: 'blur(16px)',
          background: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="container d-flex align-items-center justify-content-between py-3">

          {/* 🔥 LOGO: Ticket (blanco) + Trak (naranja) */}
          <Link
            to="/"
            className="text-decoration-none fs-4"
            style={{ letterSpacing: '-1px', fontWeight: 900 }}
          >
            <span style={{ color: '#ffffff' }}>Ticket</span>
            <span style={{ color: '#f97316' }}>Trak</span>
          </Link>

          {/* 🔥 ACTIONS */}
          <div className="d-flex align-items-center gap-3">
            <Link 
              to="/auth" 
              className="text-decoration-none x-small fw-bold text-uppercase d-none d-sm-block transition-all"
              style={{ 
                letterSpacing: '2px', 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              Mis Boletos
            </Link>

            {/* BOTÓN CARRITO */}
            <button
              onClick={() => setOpen(true)}
              className="btn position-relative rounded-pill px-3 py-2 fw-bold text-white border border-white border-opacity-10"
              style={{
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <div className="position-relative">
                <FiShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </div>

              {/* BADGE EVENTOS */}
              {totalEvents > 1 && (
                <span
                  className="position-absolute bottom-0 start-100 translate-middle badge rounded-pill bg-dark border border-primary"
                  style={{ fontSize: '0.55rem' }}
                >
                  {totalEvents} ev
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 VAULT MODAL */}
      <TicketVaultModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />

      <style>{`
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -12px;
          background: #f97316;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 20px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  )
}