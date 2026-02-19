import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { CartSummary } from '@/components/checkout/CartSummary'
import { useCart } from '@/context/CartContext'
import { createReservation, createCheckoutSession } from '@/services/api'
import { CONFIG } from '@/config'
import type { BillingDetails } from '@/types'

  const stripePromise = loadStripe(CONFIG.PUBLIC_KEY)

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, clearCart } = useCart()

  const [email, setEmail] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [wantsInvoice, setWantsInvoice] = useState(false)
  const [billing, setBilling] = useState<BillingDetails>({
    tax_id: '',
    legal_name: '',
    postal_code: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    tax_system: ''
  })
  
  const [colonias, setColonias] = useState<string[]>([])
  const [loadingCP, setLoadingCP] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePostalCodeChange = async (cp: string) => {
    setBilling(prev => ({ ...prev, postal_code: cp }))

    if (cp.length === 5) {
      setLoadingCP(true)
      try {
        const response = await fetch(`https://api.zippopotam.us/mx/${cp}`)
        if (!response.ok) throw new Error('CP no encontrado')
        const data = await response.json()
        const places = data.places || []
        const coloniasList = places.map((p: any) => p['place name'])
        const state = places[0]?.state || ''
        
        setColonias(coloniasList)
        setBilling(prev => ({
          ...prev,
          state: state,
          city: state,
          neighborhood: coloniasList.length === 1 ? coloniasList[0] : prev.neighborhood
        }))
      } catch (err) {
        setColonias([])
      } finally {
        setLoadingCP(false)
      }
    }
  }

  const handleCheckout = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    if (wantsInvoice && (!billing.tax_id || !billing.legal_name || !billing.postal_code || !billing.address)) {
      setError('Por favor completa los datos fiscales obligatorios.')
      return
    }

    const storedEventId = sessionStorage.getItem('current_event_id')
    if (!storedEventId) {
      setError('Sesión expirada. Vuelve al evento.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reservation = await createReservation({
        event_id: storedEventId,
        customer_email: email.trim(),
        items: items.map((i) => ({ tier_id: i.tier.id, quantity: i.quantity })),
        billing_details: wantsInvoice ? billing : undefined
      })

      const session = await createCheckoutSession({
        reservation_id: reservation.reservation_id,
        success_url: `${CONFIG.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CONFIG.SITE_URL}/checkout`,
      })

      if (!session.client_secret) throw new Error('Error al iniciar el proceso de pago.')
      setClientSecret(session.client_secret)
      clearCart()
    } catch (err: any) {
      setError(err.message ?? 'Error al procesar. Intenta de nuevo.')
      setLoading(false)
    }
  }

  if (totalItems === 0) {
    return (
      <div className="tk-container tk-checkout-empty">
        <p>No tienes boletos en tu carrito.</p>
        <button className="tk-btn tk-btn--ghost" onClick={() => navigate('/')}>Ver eventos</button>
      </div>
    )
  }

  if (clientSecret) {
    return (
      <div className="tk-checkout tk-checkout--embedded">
        <div className="tk-container">
          <button className="tk-btn-back" onClick={() => setClientSecret(null)}>← Corregir datos</button>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="tk-checkout">
      <div className="tk-container tk-checkout__inner">
        <button className="tk-btn-back" onClick={() => navigate(-1)}>← Volver</button>
        <h1 className="tk-checkout__title">Confirma tu pedido</h1>

        <div className="tk-checkout__grid">
          <div className="tk-checkout__summary">
            <CartSummary />
          </div>

          <div className="tk-checkout__form">
            <h2 className="tk-checkout__form-title">Datos de Contacto</h2>
            <div className="tk-form-group">
              <label htmlFor="email" className="tk-form-label">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="tk-form-input"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="tk-billing-toggle" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={wantsInvoice}
                  onChange={(e) => setWantsInvoice(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span className="tk-form-label" style={{ marginBottom: 0 }}>Requiero Factura (RFC)</span>
              </label>
            </div>

            {wantsInvoice && (
              <div className="tk-billing-form" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="tk-form-group">
                    <label className="tk-form-label">RFC</label>
                    <input
                      className="tk-form-input"
                      placeholder="XAXX010101000"
                      value={billing.tax_id}
                      onChange={(e) => setBilling({...billing, tax_id: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="tk-form-group">
                    <label className="tk-form-label">C.P.</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="tk-form-input"
                        placeholder="00000"
                        maxLength={5}
                        value={billing.postal_code}
                        onChange={(e) => handlePostalCodeChange(e.target.value.replace(/\D/g,''))}
                      />
                      {loadingCP && <span style={{ position: 'absolute', right: 10, top: 12, fontSize: '0.8rem', color: '#888' }}>...</span>}
                    </div>
                  </div>
                </div>

                <div className="tk-form-group">
                  <label className="tk-form-label">Razón Social</label>
                  <input
                    className="tk-form-input"
                    placeholder="Nombre o Razón Social"
                    value={billing.legal_name}
                    onChange={(e) => setBilling({...billing, legal_name: e.target.value})}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="tk-form-group">
                    <label className="tk-form-label">Estado</label>
                    <input
                      className="tk-form-input"
                      readOnly={colonias.length > 0}
                      value={billing.state}
                      onChange={(e) => setBilling({...billing, state: e.target.value})}
                      style={{ backgroundColor: colonias.length > 0 ? '#f9f9f9' : '#fff' }}
                    />
                  </div>
                  <div className="tk-form-group">
                    <label className="tk-form-label">Colonia</label>
                    {colonias.length > 0 ? (
                      <div style={{ position: 'relative' }}>
                        <select 
                          className="tk-form-input"
                          value={billing.neighborhood}
                          onChange={(e) => setBilling({...billing, neighborhood: e.target.value})}
                          style={{ appearance: 'none' }}
                        >
                          <option value="">Selecciona...</option>
                          {colonias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: 12, top: 14, pointerEvents: 'none' }}><ChevronDown /></div>
                      </div>
                    ) : (
                      <input
                        className="tk-form-input"
                        placeholder="Colonia"
                        value={billing.neighborhood}
                        onChange={(e) => setBilling({...billing, neighborhood: e.target.value})}
                      />
                    )}
                  </div>
                </div>

                <div className="tk-form-group">
                  <label className="tk-form-label">Dirección (Calle y Número)</label>
                  <input
                    className="tk-form-input"
                    placeholder="Calle 123, Col. Centro"
                    value={billing.address}
                    onChange={(e) => setBilling({...billing, address: e.target.value})}
                  />
                </div>
              </div>
            )}

            {error && <div className="tk-form-error" style={{ marginTop: '1rem' }}>{error}</div>}

            <button
              className="tk-btn tk-btn--primary tk-btn--full tk-btn--lg"
              onClick={handleCheckout}
              disabled={loading}
              style={{ marginTop: '2rem' }}
            >
              {loading ? 'Preparando pago...' : 'Pagar ahora →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}