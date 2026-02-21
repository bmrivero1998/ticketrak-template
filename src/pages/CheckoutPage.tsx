import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CartSummary } from '@/components/checkout/CartSummary'
import { useCart } from '@/context/CartContext'
import { createReservation, createCheckoutSession } from '@/services/api'
import { CONFIG } from '@/config'
import type { BillingDetails } from '@/types'

const stripePromise = loadStripe(CONFIG.PUBLIC_KEY, {
  stripeAccount: CONFIG.STRIPE_ACCOUNT
})

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

// --- NUEVO COMPONENTE PARA PROCESAR EL PAGO ---
const CheckoutPaymentForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setPaymentError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`, 
      },
    })

    if (error) {
      setPaymentError(error.message ?? 'Ocurrió un error inesperado con el pago.')
    }
    
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      <PaymentElement />
      {paymentError && (
        <div className="alert alert-danger py-2 mb-0">{paymentError}</div>
      )}
      <button 
        type="submit" 
        className="btn btn-primary w-100 btn-lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? 'Procesando pago...' : 'Confirmar Pagar'}
      </button>
    </form>
  )
}
// ----------------------------------------------


export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, clearCart } = useCart()

  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [contactNumber, setContactNumber] = useState('')  

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
    if (!customerName.trim()) {
      setError('Ingresa tu nombre.')
      return
    }

    if (!contactNumber.trim() || contactNumber.length < 8) {
      setError('Ingresa un número de contacto válido.')
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
        project_id: CONFIG.PROJECT_ID,
        event_id: storedEventId,
        customer_email: email.trim(),
        customer_name: customerName.trim(),
        contact_phone: contactNumber.trim(),
        items: items.map((i) => ({ tier_id: i.tier.id, quantity: i.quantity })),
        billing_details: wantsInvoice ? billing : undefined
      })

      const firstData = reservation[0];

      const session = await createCheckoutSession({
        reservation_id: firstData.id,
        project_uuid: CONFIG.PROJECT_ID,
        customer_data:{
          email: email,
          name: customerName
        }
      })

      if (!session.clientSecret) throw new Error('Error al iniciar el proceso de pago.')
      setClientSecret(session.clientSecret)
      clearCart()
    } catch (err: any) {
      setError(err.message ?? 'Error al procesar. Intenta de nuevo.')
      setLoading(false)
    }
  }

  // 1. Mostrar Stripe Elements si ya tenemos el Payment Intent
  if (clientSecret) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-6">
            <button className="btn btn-link text-decoration-none ps-0 mb-3" onClick={() => setClientSecret(null)}>
              ← Corregir datos
            </button>
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title h5 mb-4">Ingresa tu método de pago</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutPaymentForm />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Mostrar Carrito vacío si no hay items ni clientSecret activo
  if (totalItems === 0) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">No tienes boletos en tu carrito.</p>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>Ver eventos</button>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <button className="btn btn-link text-decoration-none ps-0 mb-3" onClick={() => navigate(-1)}>
        ← Volver
      </button>
      <h1 className="h4 mb-4">Confirma tu pedido</h1>

      <div className="row g-4">
        {/* Resumen del carrito */}
        <div className="col-12 col-lg-5">
          <CartSummary />
        </div>

        {/* Formulario */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title h5 mb-4">Datos de Contacto</h2>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-control"
                  placeholder="Tu nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono / WhatsApp</label>
                <input
                  className="form-control"
                  placeholder="5512345678"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value.replace(/\D/g,''))}
                  disabled={loading}
                />
              </div>

              {/* Toggle Factura */}
              <div className="border-top pt-3 mt-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="wantsInvoice"
                    checked={wantsInvoice}
                    onChange={(e) => setWantsInvoice(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="wantsInvoice">
                    Requiero Factura (RFC)
                  </label>
                </div>
              </div>

              {/* Datos fiscales */}
              {wantsInvoice && (
                <div className="mt-3 d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">RFC</label>
                      <input
                        className="form-control"
                        placeholder="XAXX010101000"
                        value={billing.tax_id}
                        onChange={(e) => setBilling({...billing, tax_id: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">C.P.</label>
                      <div className="position-relative">
                        <input
                          className="form-control"
                          placeholder="00000"
                          maxLength={5}
                          value={billing.postal_code}
                          onChange={(e) => handlePostalCodeChange(e.target.value.replace(/\D/g,''))}
                        />
                        {loadingCP && (
                          <span className="position-absolute end-0 top-50 translate-middle-y pe-3 text-muted small">
                            ...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Razón Social</label>
                    <input
                      className="form-control"
                      placeholder="Nombre o Razón Social"
                      value={billing.legal_name}
                      onChange={(e) => setBilling({...billing, legal_name: e.target.value})}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">Estado</label>
                      <input
                        className={`form-control ${colonias.length > 0 ? 'bg-light' : ''}`}
                        readOnly={colonias.length > 0}
                        value={billing.state}
                        onChange={(e) => setBilling({...billing, state: e.target.value})}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Colonia</label>
                      {colonias.length > 0 ? (
                        <div className="position-relative">
                          <select 
                            className="form-select"
                            value={billing.neighborhood}
                            onChange={(e) => setBilling({...billing, neighborhood: e.target.value})}
                          >
                            <option value="">Selecciona...</option>
                            {colonias.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {/* Bootstrap maneja el chevron en form-select automáticamente */}
                        </div>
                      ) : (
                        <input
                          className="form-control"
                          placeholder="Colonia"
                          value={billing.neighborhood}
                          onChange={(e) => setBilling({...billing, neighborhood: e.target.value})}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Dirección (Calle y Número)</label>
                    <input
                      className="form-control"
                      placeholder="Calle 123, Col. Centro"
                      value={billing.address}
                      onChange={(e) => setBilling({...billing, address: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>
              )}

              <button
                className="btn btn-primary w-100 btn-lg mt-4"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Preparando pago...' : 'Pagar ahora →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}