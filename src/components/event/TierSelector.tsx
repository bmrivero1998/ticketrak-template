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
    <div className="d-flex flex-column gap-3">
      {tiers.map((tier) => {
        const qty = getQty(tier.id)
        const soldOut = tier.stock_total - tier.stock_sold === 0

        return (
          <div
            key={tier.id}
            className={`card shadow-sm ${soldOut ? 'opacity-50' : ''}`}
          >
            <div className="card-body d-flex justify-content-between align-items-center gap-3 flex-wrap">
              {/* Info */}
              <div className="flex-grow-1">
                <h4 className="h6 fw-bold mb-1">{tier.name}</h4>
                {tier.settings && (
                  <p className="text-muted small mb-1">
                    {tier.settings.donation_enabled ? 'Incluye donación' : 'Sin donación'}
                  </p>
                )}
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-semibold text-primary">
                    {tier.price_amount === 0 ? 'Gratis' : formatCurrency(tier.price_amount)}
                  </span>
                  <span className={`small ${soldOut ? 'text-danger' : tier.stock_total - tier.stock_sold <= 10 ? 'text-warning fw-semibold' : 'text-muted'}`}>
                    {soldOut
                      ? 'Agotado'
                      : tier.stock_total - tier.stock_sold <= 10
                      ? `¡Últimos ${tier.stock_total - tier.stock_sold}!`
                      : `${tier.stock_total - tier.stock_sold} disponibles`}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-shrink-0">
                {soldOut ? (
                  <span className="badge bg-secondary">AGOTADO</span>
                ) : qty === 0 ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => addItem(tier, 1)}
                  >
                    Agregar
                  </button>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm px-2 py-1 lh-1"
                      onClick={() => updateQuantity(tier.id, qty - 1)}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="fw-bold px-1">{qty}</span>
                    <button
                      className="btn btn-outline-secondary btn-sm px-2 py-1 lh-1"
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
          </div>
        )
      })}
    </div>
  )
}