import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { formatCurrency, CONFIG } from '../../config'

const { PRIMARY, BACKGROUND, TEXT, TEXT_SECONDARY } = CONFIG.THEME

// Derivados del tema
const PRIMARY_RGB = hexToRgb(PRIMARY)   // para rgba()
const BG_RGB      = hexToRgb(BACKGROUND)

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// Genera color más claro/oscuro relativo al bg
const bgLighter  = `rgba(255,255,255,0.06)`
const bgBorder   = `rgba(255,255,255,0.08)`
const bgHighlight= `rgba(${PRIMARY_RGB},0.12)`
const bgHighBorder= `rgba(${PRIMARY_RGB},0.22)`

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .trak-cart {
    font-family: 'DM Sans', sans-serif;
  }

  .trak-card {
    background: linear-gradient(145deg,
      ${BACKGROUND} 0%,
      rgba(${BG_RGB},0.92) 50%,
      ${BACKGROUND} 100%
    );
    border: 1px solid ${bgBorder};
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03) inset,
      0 20px 60px rgba(0,0,0,0.55),
      0 4px 16px rgba(0,0,0,0.3);
    position: relative;
  }

  /* Brillo sutil en la cima */
  .trak-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    pointer-events: none;
  }

  /* Glow de color primario en esquina */
  .trak-card::after {
    content: '';
    position: absolute;
    top: -70px; right: -70px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(${PRIMARY_RGB},0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .trak-header {
    padding: 1.4rem 1.4rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .trak-icon {
    width: 38px; height: 38px;
    background: ${PRIMARY};
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.05rem;
    box-shadow: 0 4px 14px rgba(${PRIMARY_RGB},0.45);
    flex-shrink: 0;
  }

  .trak-eyebrow {
    font-size: 0.67rem;
    color: ${TEXT_SECONDARY};
    font-weight: 400;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-bottom: 1px;
  }

  .trak-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.12rem;
    font-weight: 700;
    color: ${TEXT};
    letter-spacing: -0.01em;
    margin: 0;
  }

  .trak-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${bgBorder}, transparent);
    margin: 1.2rem 1.4rem;
  }

  /* ── Items ── */
  .trak-list {
    padding: 0 1.4rem;
    list-style: none;
    margin: 0;
  }

  .trak-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.045);
    gap: 0.75rem;
    animation: trak-in 0.28s ease both;
  }

  @keyframes trak-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: none; }
  }
  .trak-item:nth-child(1) { animation-delay: 0.04s; }
  .trak-item:nth-child(2) { animation-delay: 0.10s; }
  .trak-item:nth-child(3) { animation-delay: 0.16s; }
  .trak-item:nth-child(4) { animation-delay: 0.22s; }
  .trak-item:last-child   { border-bottom: none; }

  .trak-item-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex: 1;
    min-width: 0;
  }

  .trak-qty {
    width: 28px; height: 28px;
    background: ${bgHighlight};
    border: 1px solid ${bgHighBorder};
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: ${PRIMARY};
    flex-shrink: 0;
  }

  .trak-name {
    font-size: 0.86rem;
    font-weight: 500;
    color: ${TEXT};
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trak-meta {
    font-size: 0.7rem;
    display: block;
    margin-top: 1px;
  }
  .trak-meta-paid     { color: ${TEXT_SECONDARY}; }
  .trak-meta-donation { color: #f5a623; }
  .trak-meta-free     { color: #3ecf8e; }

  .trak-item-right {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-shrink: 0;
  }

  .trak-price {
    font-size: 0.88rem;
    font-weight: 600;
    color: ${TEXT};
    min-width: 4.8rem;
    text-align: right;
  }
  .trak-price-free { color: #3ecf8e; }

  .trak-remove {
    width: 26px; height: 26px;
    border-radius: 7px;
    border: 1px solid rgba(239,68,68,0.2);
    background: rgba(239,68,68,0.07);
    color: rgba(239,68,68,0.4);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.17s ease;
    font-size: 1.05rem;
    line-height: 1;
    flex-shrink: 0;
  }
  .trak-remove:hover {
    background: rgba(239,68,68,0.18);
    border-color: rgba(239,68,68,0.5);
    color: #f87171;
    transform: scale(1.1);
  }
  .trak-remove:active { transform: scale(0.93); }

  /* ── Total ── */
  .trak-total {
    margin: 0.9rem 1.4rem 0;
    padding: 1rem 1.2rem;
    background: ${bgHighlight};
    border: 1px solid ${bgHighBorder};
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .trak-total-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: ${TEXT_SECONDARY};
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .trak-total-amount {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${PRIMARY};
    letter-spacing: -0.02em;
    /* si el primary es claro, se ve bien directo; si es oscuro usamos fallback blanco */
    text-shadow: 0 0 20px rgba(${PRIMARY_RGB}, 0.4);
  }

  /* ── Footer ── */
  .trak-footer {
    padding: 0.85rem 1.4rem 1.4rem;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }
  .trak-footer span {
    font-size: 0.66rem;
    color: rgba(255,255,255,0.16);
    line-height: 1.55;
  }

  /* ── Empty ── */
  .trak-empty {
    padding: 2.5rem 1.5rem;
    text-align: center;
  }
  .trak-empty-icon { font-size: 1.8rem; opacity: 0.18; display: block; margin-bottom: 0.6rem; }
  .trak-empty-text { font-size: 0.82rem; color: ${TEXT_SECONDARY}; }
`

export function CartSummary() {
  const { items, totalCents, removeItem } = useCart()
  const [removing, setRemoving] = useState<string | null>(null)

  const handleRemove = (tierId: string) => {
    setRemoving(tierId)
    setTimeout(() => {
      removeItem(tierId)
      setRemoving(null)
    }, 180)
  }

  return (
    <div className="trak-cart">
      <style>{styles}</style>

      <div className="trak-card">

        {/* Header */}
        <div className="trak-header">
          <div className="trak-icon">🎟</div>
          <div>
            <p className="trak-eyebrow">Resumen</p>
            <h3 className="trak-title">Tu Pedido</h3>
          </div>
        </div>

        <div className="trak-divider" />

        {items.length === 0 ? (
          <div className="trak-empty">
            <span className="trak-empty-icon">🛒</span>
            <p className="trak-empty-text">Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <ul className="trak-list">
              {items.map((item) => {
                const { tier, quantity, donationAmount } = item
                const unitPrice = tier.type === 'DONATION'
                  ? (donationAmount || tier.min_donation_amount)
                  : tier.price_amount
                const lineTotal = unitPrice * quantity
                const isRemoving = removing === tier.id

                return (
                  <li
                    key={tier.id}
                    className="trak-item"
                    style={{
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? 'translateX(10px)' : 'none',
                      transition: 'opacity 0.18s ease, transform 0.18s ease',
                    }}
                  >
                    <div className="trak-item-left">
                      <div className="trak-qty">×{quantity}</div>
                      <div style={{ minWidth: 0 }}>
                        <span className="trak-name">{tier.name}</span>
                        {tier.type === 'DONATION' && (
                          <span className="trak-meta trak-meta-donation">
                            💛 {formatCurrency(unitPrice)} por boleto
                          </span>
                        )}
                        {tier.type === 'FREE' && (
                          <span className="trak-meta trak-meta-free">✓ Gratuito</span>
                        )}
                        {tier.type === 'PAID' && (
                          <span className="trak-meta trak-meta-paid">
                            {formatCurrency(unitPrice)} c/u
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="trak-item-right">
                      <span className={`trak-price ${tier.type === 'FREE' ? 'trak-price-free' : ''}`}>
                        {tier.type === 'FREE' ? 'Gratis' : formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Total */}
            <div className="trak-total">
              <span className="trak-total-label">Total a pagar</span>
              <span className="trak-total-amount">{formatCurrency(totalCents)}</span>
            </div>

            {/* Footer */}
            <div className="trak-footer">
              <span>🔒</span>
              <span>Pago seguro con encriptación SSL · Los precios incluyen cargos por servicio.</span>
            </div>
          </>
        )}

      </div>
    </div>
  )
}