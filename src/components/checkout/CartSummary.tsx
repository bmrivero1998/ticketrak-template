import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/config'

/**
 * Componente que renderiza el desglose detallado de los boletos en el carrito.
 * Calcula subtotales dinámicos basados en el tipo de tier (PAID, FREE, DONATION).
 * * @returns JSX.Element Resumen de compra con items y total general.
 */
export function CartSummary() {
  const { items, totalCents, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="card shadow-sm border-0 bg-light">
        <div className="card-body p-4 text-center text-muted">
          <p className="mb-0">Tu carrito está vacío.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm border-0 bg-light">
      <div className="card-body p-4">
        <h3 className="card-title h5 mb-4 fw-bold">Tu Pedido</h3>

        <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
          {items.map((item) => {
            const { tier, quantity, donationAmount } = item
            
            /**
             * Determinación del precio unitario:
             * Si es DONATION, prioriza el monto personalizado sobre el mínimo.
             * De lo contrario, utiliza el precio base del tier.
             */
            const unitPrice = tier.type === 'DONATION' 
                ? (donationAmount || tier.min_donation_amount) 
                : tier.price_amount;
            
            const lineTotal = unitPrice * quantity;

            return (
              <li key={tier.id} className="d-flex justify-content-between align-items-start">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold text-dark">{tier.name}</span>
                    <span 
                      className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill"
                      style={{ minWidth: '2.5rem', textAlign: 'center' }}
                    >
                      × {quantity}
                    </span>
                  </div>
                  
                  {tier.type === 'DONATION' && (
                    <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                      Donativo: {formatCurrency(unitPrice)} c/u
                    </span>
                  )}
                  {tier.type === 'FREE' && (
                    <span className="text-success fw-medium small" style={{ fontSize: '0.8rem' }}>
                      Boleto Gratuito
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 mt-1">
                  <span className="fw-bold text-dark">
                    {tier.type === 'FREE' ? formatCurrency(0) : formatCurrency(lineTotal)}
                  </span>
                  <button
                    className="btn btn-link text-danger p-0 lh-1 text-decoration-none fs-4"
                    onClick={() => removeItem(tier.id)}
                    aria-label={`Eliminar ${tier.name}`}
                    style={{ outline: 'none', boxShadow: 'none', marginTop: '-4px' }}
                  >
                    ×
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="border-top pt-3 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark fs-5">Total</span>
          <strong className="text-primary fs-4 fw-black">
            {formatCurrency(totalCents)}
          </strong>
        </div>
      </div>
    </div>
  )
}