import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { CONFIG } from '@/config'
import type { Tier } from '@/types'
import { 
  BiGift, 
  BiHeart, 
  BiPlus, 
  BiMinus,
  BiCheckCircle,
  BiInfoCircle,
  BiTrendingUp
} from 'react-icons/bi'
import { FaDonate } from 'react-icons/fa'
import { MdLocalOffer } from 'react-icons/md'
import { BsTicketDetailed } from 'react-icons/bs'

interface Props {
  tiers: Tier[]
  currency: string
  event_id: string
  project_id: string
  event_name: string
  event_poster?: string
}

const formatCurrency = (cents: number, currencyCode: string) => {
  return new Intl.NumberFormat(CONFIG.LOCALE, { 
    style: 'currency',
    currency: currencyCode, 
  }).format(cents / 100)
}

export function TierSelector({ tiers, currency, event_id, project_id, event_name, event_poster }: Props) {
  const { items, totalItems, addItem, updateQuantity, updateDonation } = useCart()
  const [donationInputs, setDonationInputs] = useState<Record<string, string>>({})
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  const getQty = (tierId: string) => items.find((i) => i.tier.id === tierId)?.quantity ?? 0

  const currentFreeCount = items.reduce((sum, i) => i.tier.type === 'FREE' ? sum + i.quantity : sum, 0);
  const isGlobalLimitReached = totalItems >= CONFIG.MAX_TICKETS_PER_ORDER;

  const handleDonationChange = (tier: Tier, value: string) => {
      setDonationInputs(prev => ({ ...prev, [tier.id]: value }));
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
          updateDonation(tier.id, Math.round(numValue * 100));
      }
  };

  const getTierIcon = (type: string) => {
    switch(type) {
      case 'FREE': return <BiGift size={20} />;
      case 'DONATION': return <FaDonate size={18} />;
      default: return <BsTicketDetailed size={20} />;
    }
  };

  const getStockStatus = (availableStock: number, soldOut: boolean) => {
    if (soldOut) return { text: 'Agotado', color: 'danger', icon: null };
    if (availableStock <= 5) return { text: `¡Últimos ${availableStock}!`, color: 'warning', icon: <BiTrendingUp size={12} /> };
    if (availableStock <= 10) return { text: `Solo ${availableStock} disponibles`, color: 'info', icon: null };
    return { text: `${availableStock} disponibles`, color: 'secondary', icon: null };
  };

  return (
    <div className="d-flex flex-column gap-3">
      {tiers.map((tier) => {
        const qty = getQty(tier.id)
        const cartItem = items.find((i) => i.tier.id === tier.id)
        
        const availableStock = tier.stock_total - tier.stock_sold
        const soldOut = availableStock <= 0
        const isDonation = tier.type === 'DONATION'
        
        const isFreeLimitReached = tier.type === 'FREE' && currentFreeCount >= CONFIG.MAX_FREE_TICKETS;
        const shouldDisableAdd = isFreeLimitReached || isGlobalLimitReached || soldOut;
        
        const stockStatus = getStockStatus(availableStock, soldOut);
        const isHovered = hoveredTier === tier.id;

        return (
          <div 
            key={tier.id} 
            className={`card border-0 transition-all ${soldOut ? 'opacity-60' : ''}`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              backdropFilter: 'blur(10px)',
              border: isHovered ? '1px solid rgba(13,110,253,0.3)' : '1px solid rgba(255,255,255,0.1)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isHovered ? '0 8px 25px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={() => setHoveredTier(tier.id)}
            onMouseLeave={() => setHoveredTier(null)}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-primary" style={{ opacity: 0.8 }}>
                      {getTierIcon(tier.type)}
                    </span>
                    <h4 className="h5 fw-bold mb-0 text-white">{tier.name}</h4>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                    <div className="d-flex align-items-center gap-1">
                      <span className="fw-bold fs-5 text-primary">
                        {tier.type === 'FREE' 
                            ? 'Gratis' 
                            : tier.type === 'DONATION' 
                                ? `Donación voluntaria`
                                : formatCurrency(tier.price_amount, currency)}
                      </span>
                      {tier.type === 'DONATION' && (
                        <small className="text-muted">
                          (Mín. {formatCurrency(tier.min_donation_amount, currency)})
                        </small>
                      )}
                    </div>
                    
                    {!soldOut && availableStock > 0 && (
                      <div className={`d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-${stockStatus.color} bg-opacity-10`}>
                        {stockStatus.icon}
                        <span className={`small text-${stockStatus.color} fw-semibold`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    )}
                    
                    {soldOut && (
                      <div className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-danger bg-opacity-10">
                        <BiInfoCircle size={12} className="text-danger" />
                        <span className="small text-danger fw-semibold">Sin stock</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {soldOut ? (
                    <button className="btn btn-secondary btn-sm rounded-pill px-4 py-2" disabled>
                      <BiInfoCircle className="me-1" size={14} />
                      AGOTADO
                    </button>
                  ) : qty === 0 ? (
                    <button
                      className="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 transition-all"
                      style={{
                        transition: 'all 0.2s ease',
                        transform: isHovered && !shouldDisableAdd ? 'scale(1.05)' : 'scale(1)'
                      }}
                      onClick={() =>
                        addItem(
                          tier,
                          1,
                          event_id,
                          project_id,
                          event_name,
                          event_poster,
                          isDonation ? tier.min_donation_amount : undefined,
                          currency
                        )
                      }
                      disabled={shouldDisableAdd}
                    >
                      <BiPlus size={16} />
                      {isFreeLimitReached ? 'Límite gratis' : isGlobalLimitReached ? 'Límite máximo' : 'Agregar'}
                    </button>
                  ) : (
                    <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-50 rounded-pill p-1 border border-primary border-opacity-25">
                      <button 
                        className="btn btn-dark btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center transition-all" 
                        style={{ 
                          width: '36px', 
                          height: '36px',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => updateQuantity(tier.id, qty - 1)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <BiMinus size={18} />
                      </button>
                      <span className="fw-bold px-3 text-white" style={{ minWidth: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>
                        {qty}
                      </span>
                      <button 
                        className="btn btn-primary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center transition-all" 
                        style={{ 
                          width: '36px', 
                          height: '36px',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => updateQuantity(tier.id, qty + 1)} 
                        disabled={qty >= availableStock || shouldDisableAdd}
                        onMouseEnter={(e) => {
                          if (!(qty >= availableStock || shouldDisableAdd)) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <BiPlus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isDonation && qty > 0 && (
                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 animate-slideDown">
                  <label className="form-label small mb-2 text-muted fw-semibold d-flex align-items-center gap-2">
                    <BiHeart className="text-danger" size={14} />
                    Tu donativo por boleto
                    <span className="text-primary">({currency})</span>:
                  </label>
                  <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
                    <span className="input-group-text bg-primary bg-opacity-10 border-0 text-primary fw-bold">
                      {currency === 'MXN' ? '$' : currency === 'USD' ? 'US$' : '€'}
                    </span>
                    <input 
                      type="number" 
                      className="form-control bg-dark border-0 text-white shadow-none" 
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      min={tier.min_donation_amount / 100}
                      step={currency === 'MXN' ? 10 : 1}
                      placeholder={(tier.min_donation_amount / 100).toString()}
                      value={donationInputs[tier.id] !== undefined ? donationInputs[tier.id] : (cartItem?.donationAmount ? cartItem.donationAmount / 100 : tier.min_donation_amount / 100)}
                      onChange={(e) => handleDonationChange(tier, e.target.value)}
                    />
                    {cartItem?.donationAmount && cartItem.donationAmount / 100 > tier.min_donation_amount / 100 && (
                      <span className="input-group-text bg-success bg-opacity-10 border-0 text-success">
                        <BiHeart className="me-1" size={12} />
                        +{formatCurrency(cartItem.donationAmount - tier.min_donation_amount, currency)}
                      </span>
                    )}
                  </div>
                  {(donationInputs[tier.id] !== undefined && parseFloat(donationInputs[tier.id]) * 100 < tier.min_donation_amount) && (
                    <div className="text-danger small mt-2 fw-semibold d-flex align-items-center gap-2 animate-shake">
                      <MdLocalOffer size={14} />
                      El mínimo es {formatCurrency(tier.min_donation_amount, currency)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      <style>{`
        .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .card {
          border-radius: 16px !important;
          overflow: hidden;
        }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 0.5;
        }
        
        input[type="number"]:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  )
}