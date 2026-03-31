import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const formatCurrency = (cents: number, currency: string) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function TicketVaultModal({ isOpen, onClose }: Props) {
  const { cartMap, clearCart } = useCart()
  const navigate = useNavigate()

  const events = Object.entries(cartMap)

  if (!isOpen) return null

  const handleCheckout = (eventId: string) => {
    // 🔥 IMPORTANTE: setear el evento activo antes de ir a checkout
    sessionStorage.setItem('current_event_id', eventId)

    onClose()

    setTimeout(() => {
      navigate('/checkout')
    }, 150)
  }

  const handleRemoveEvent = (eventId: string) => {
    sessionStorage.setItem('current_event_id', eventId)
    clearCart()
  }

  return (
    <div className="vault-overlay">
      <div className="vault-modal">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-white mb-0">🎟️ Tus pedidos</h3>
          <button className="btn-close btn-close-white" onClick={onClose} />
        </div>

        {/* EMPTY */}
        {events.length === 0 && (
          <div className="text-center py-5 text-white-50">
            No has agregado boletos aún
          </div>
        )}

        {/* EVENTS */}
        <div className="d-flex flex-column gap-4">
          {events.map(([eventId, items]) => {
            const total = items.reduce((sum, i) => {
              const price =
                i.tier.type === 'DONATION'
                  ? i.donationAmount || i.tier.min_donation_amount
                  : i.tier.price_amount

              return sum + price * i.quantity
            }, 0)

            const currency = items[0]?.currency || 'MXN'
            const name = items[0]?.event_name || 'Evento'
            const poster = items[0]?.event_poster

            return (
              <div key={eventId} className="event-card">

                {/* IMAGE */}
                {poster && (
                  <img
                    src={poster}
                    className="event-image"
                    alt={name}
                  />
                )}

                <div className="p-3">

                  {/* TITLE + DELETE */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-white mb-0">
                      {name}
                    </h5>

                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => handleRemoveEvent(eventId)}
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* ITEMS */}
                  <div className="d-flex flex-column gap-2 mb-3">
                    {items.map((item) => (
                      <div
                        key={item.tier.id}
                        className="d-flex justify-content-between text-white-50 small"
                      >
                        <span>
                          {item.tier.name} x{item.quantity}
                        </span>
                        <span>
                          {formatCurrency(
                            (item.tier.type === 'DONATION'
                              ? item.donationAmount || item.tier.min_donation_amount
                              : item.tier.price_amount) * item.quantity,
                            item.currency
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white fw-bold">Total</span>
                    <span className="text-primary fw-bold">
                      {formatCurrency(total, currency)}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    className="btn btn-primary w-100 rounded-pill fw-bold"
                    onClick={() => handleCheckout(eventId)}
                  >
                    Pagar este evento →
                  </button>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .vault-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }

        .vault-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          background: #0f0f0f;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .event-card {
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.2s ease;
        }

        .event-card:hover {
          transform: translateY(-2px);
        }

        .event-image {
          width: 100%;
          height: 140px;
          object-fit: cover;
        }
      `}</style>
    </div>
  )
}