import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/config'

export function CartSummary() {
  const { items, totalCents, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <p>Tu carrito está vacío.</p>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title h5 mb-3">Tu Pedido</h3>

        <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
          {items.map(({ tier, quantity }) => (
            <li key={tier.id} className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-medium">{tier.name}</span>
                <span className="text-muted small">× {quantity}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">
                  {formatCurrency(tier.price_amount * quantity)}
                </span>
                <button
                  className="btn btn-link text-danger p-0 lh-1 text-decoration-none"
                  onClick={() => removeItem(tier.id)}
                  aria-label={`Eliminar ${tier.name}`}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-top pt-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Total</span>
          <strong className="text-primary fs-5">{formatCurrency(totalCents)}</strong>
        </div>
      </div>
    </div>
  )
}