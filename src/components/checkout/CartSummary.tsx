import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/config'

export function CartSummary() {
  const { items, totalCents, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="tk-cart-empty">
        <p>Tu carrito está vacío.</p>
      </div>
    )
  }

  return (
    <div className="tk-cart-summary">
      <h3 className="tk-cart-summary__title">Tu Pedido</h3>

      <ul className="tk-cart-summary__list">
        {items.map(({ tier, quantity }) => (
          <li key={tier.id} className="tk-cart-summary__item">
            <div className="tk-cart-summary__item-info">
              <span className="tk-cart-summary__item-name">{tier.name}</span>
              <span className="tk-cart-summary__item-qty">× {quantity}</span>
            </div>
            <div className="tk-cart-summary__item-right">
              <span className="tk-cart-summary__item-price">
                {formatCurrency(tier.price_amount * quantity)}
              </span>
              <button
                className="tk-cart-summary__remove"
                onClick={() => removeItem(tier.id)}
                aria-label={`Eliminar ${tier.name}`}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="tk-cart-summary__total">
        <span>Total</span>
        <strong>{formatCurrency(totalCents)}</strong>
      </div>
    </div>
  )
}
