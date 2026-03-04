/**
 * Componente TierSelector.
 * Renderiza la lista de boletos disponibles y permite agregarlos al carrito.
 * Integrado con el CartContext y con límites estrictos visuales.
 */
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { CONFIG } from '../../config' // 🔥 IMPORTAMOS LA CONFIGURACIÓN AQUÍ
import type { Tier } from '../../types'

interface Props {
  tiers: Tier[]
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(cents / 100)
}

export function TierSelector({ tiers }: Props) {
  const { items, addItem, updateQuantity, updateDonation } = useCart()
  const [donationInputs, setDonationInputs] = useState<Record<string, string>>({})

  const getQty = (tierId: string) =>
    items.find((i) => i.tier.id === tierId)?.quantity ?? 0

  // 🔥 CALCULAMOS CUÁNTOS BOLETOS GRATIS YA HAY EN EL CARRITO EN TIEMPO REAL
  const currentFreeCount = items.reduce((sum, i) => 
    i.tier.type === 'FREE' ? sum + i.quantity : sum
  , 0);

  const handleDonationChange = (tier: Tier, value: string) => {
      setDonationInputs(prev => ({ ...prev, [tier.id]: value }));
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
          updateDonation(tier.id, Math.round(numValue * 100));
      }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {tiers.map((tier) => {
        const qty = getQty(tier.id)
        const cartItem = items.find((i) => i.tier.id === tier.id)
        const soldOut = tier.stock_total - tier.stock_sold <= 0
        const isDonation = tier.type === 'DONATION'
        
        // 🔥 SABER SI ESTE BOTÓN DEBE ESTAR BLOQUEADO POR REGLA DE GRATIS
        const isFreeLimitReached = tier.type === 'FREE' && currentFreeCount >= CONFIG.MAX_FREE_TICKETS;

        return (
          <div
            key={tier.id}
            className={`card shadow-sm ${soldOut ? 'opacity-50' : ''}`}
          >
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                  {/* --- Información Principal del Tier --- */}
                  <div className="flex-grow-1">
                    <h4 className="h6 fw-bold mb-1">{tier.name}</h4>
                    {tier.settings && (
                      <p className="text-muted small mb-1">
                        {tier.settings.donation_enabled ? 'Incluye donación' : 'Sin donación'}
                      </p>
                    )}
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-semibold text-primary">
                        {tier.type === 'FREE' 
                            ? 'Gratis' 
                            : tier.type === 'DONATION' 
                                ? `Donación (Mínimo ${formatCurrency(tier.min_donation_amount)})`
                                : formatCurrency(tier.price_amount)}
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

                  {/* --- Controles de Cantidad (Agregar / Quitar) --- */}
                  <div className="flex-shrink-0">
                    {soldOut ? (
                      <span className="badge bg-secondary">AGOTADO</span>
                    ) : qty === 0 ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => addItem(tier, 1, isDonation ? tier.min_donation_amount : undefined)}
                        // 🔥 BLOQUEAMOS EL BOTÓN INICIAL SI YA LLEGÓ AL LÍMITE
                        disabled={isFreeLimitReached}
                      >
                        {isFreeLimitReached ? 'Límite alcanzado' : 'Agregar'}
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
                          // 🔥 BLOQUEAMOS EL BOTÓN DE "+" SI YA LLEGÓ AL LÍMITE
                          disabled={qty >= tier.stock_total - tier.stock_sold || isFreeLimitReached}
                          aria-label="Agregar uno"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Input de Donación Personalizada --- */}
                {isDonation && qty > 0 && (
                    <div className="mt-3 pt-3 border-top">
                        <label className="form-label small mb-1 text-muted">
                            Tu donativo (por boleto):
                        </label>
                        <div className="input-group input-group-sm" style={{ maxWidth: '200px' }}>
                            <span className="input-group-text">$</span>
                            <input 
                                type="number" 
                                className="form-control" 
                                min={tier.min_donation_amount / 100}
                                step="1"
                                placeholder={(tier.min_donation_amount / 100).toString()}
                                value={
                                    donationInputs[tier.id] !== undefined 
                                        ? donationInputs[tier.id] 
                                        : (cartItem?.donationAmount 
                                            ? cartItem.donationAmount / 100 
                                            : tier.min_donation_amount / 100)
                                }
                                onChange={(e) => handleDonationChange(tier, e.target.value)}
                            />
                        </div>
                        {(donationInputs[tier.id] !== undefined && parseFloat(donationInputs[tier.id]) * 100 < tier.min_donation_amount) && (
                            <div className="text-danger small mt-1">
                                El monto mínimo es de {formatCurrency(tier.min_donation_amount)}
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        )
      })}
    </div>
  )
}