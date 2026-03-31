import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'

export function CartDrawerSummary() {
  const { totalCents, totalItems, cartMap } = useCart()
  const navigate = useNavigate()

  const eventCount = Object.keys(cartMap).length
  const currency = 'MXN' // puedes mejorar esto luego

  if (totalItems === 0) return null

  return (
    <div className="p-4 bg-black border-top border-white border-opacity-10">
      
      {/* Eventos */}
      <div className="d-flex justify-content-between mb-2">
        <span className="text-white-50 small">Eventos</span>
        <strong className="text-white">{eventCount}</strong>
      </div>

      {/* Total */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="text-white-50 x-small text-uppercase">Total</span>
        </div>
        <div className="text-end">
          <span className="text-white fw-black fs-4">
            ${totalCents / 100}
          </span>
          <span className="text-primary-light ms-1 x-small fw-bold">
            {currency}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary w-100 py-3 rounded-4 fw-black"
        onClick={() => navigate('/checkout')}
      >
        CONTINUAR →
      </button>
    </div>
  )
}