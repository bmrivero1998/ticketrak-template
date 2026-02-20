import type { Tier } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/config'

interface Props {
  tiers: Tier[]
}

export function TierSelector({ tiers }: Props) {
  const { items, addItem, updateQuantity } = useCart()

  const getQty = (tierId: string) =>
    items.find((i) => i.tier.id === tierId)?.quantity ?? 0



  return (
    <div className="tk-tiers">
      {tiers.map((tier) => {
        const qty = getQty(tier.id)
        const soldOut = tier.stock_total - tier.stock_sold === 0

        return (
          <div key={tier.id} className={`tk-tier ${soldOut ? 'tk-tier--sold-out' : ''}`}>
            <div className="tk-tier__info">
              <h4 className="tk-tier__name">{tier.name}</h4>
              {tier.settings && (
                <p className="tk-tier__desc">{tier.settings.donation_enabled ? 'Incluye donación' : 'Sin donación'}</p>
              )}
              <div className="tk-tier__meta">
                <span className="tk-tier__price">
                  {tier.price_amount === 0 ? 'Gratis' : formatCurrency(tier.price_amount)}
                </span>
                <span className="tk-tier__stock">
                  {soldOut
                    ? 'Agotado'
                    : tier.stock_total - tier.stock_sold <= 10
                    ? `¡Últimos ${tier.stock_total - tier.stock_sold}!`
                    : `${tier.stock_total - tier.stock_sold} disponibles`}
                </span>
              </div>
            </div>

            <div className="tk-tier__controls">
              {soldOut ? (
                <span className="tk-tier__soldout-label">AGOTADO</span>
              ) : qty === 0 ? (
                <button
                  className="tk-btn tk-btn--primary tk-btn--sm"
                  onClick={() => addItem(tier, 1)}
                >
                  Agregar
                </button>
              ) : (
                <div className="tk-qty">
                  <button
                    className="tk-qty__btn"
                    onClick={() => updateQuantity(tier.id, qty - 1)}
                    aria-label="Quitar uno"
                  >
                    −
                  </button>
                  <span className="tk-qty__value">{qty}</span>
                  <button
                    className="tk-qty__btn"
                    onClick={() => updateQuantity(tier.id, qty + 1)}
                    disabled={qty >= tier.stock_total - tier.stock_sold}
                    aria-label="Agregar uno"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
