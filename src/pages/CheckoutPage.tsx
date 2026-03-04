import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CartSummary } from '@/components/checkout/CartSummary'
import { useCart } from '@/context/CartContext'
import { createReservation, createCheckoutSession, getHandshake, getEventTiers } from '@/services/api'
import { CONFIG } from '@/config'
import type { BillingDetails } from '@/types'
import { TicketrakTimer } from '@/components/checkout/CheckoutTimer'

const stripePromise = loadStripe(CONFIG.PUBLIC_KEY, {
  stripeAccount: CONFIG.STRIPE_ACCOUNT
})

// ─── Pantalla de sesión expirada ──────────────────────────────────────────────
const SessionExpiredScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  }}>
    <div style={{ width: 80, height: 80, marginBottom: '1.5rem' }}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <style>{`
          @keyframes hourglass-spin {
            0%, 40% { transform-origin: 40px 40px; transform: rotate(0deg); }
            60%, 100% { transform-origin: 40px 40px; transform: rotate(180deg); }
          }
          .hourglass-group { animation: hourglass-spin 3s ease-in-out infinite; }
          @keyframes sand-fall {
            0% { opacity: 0; cy: 36; }
            20% { opacity: 1; }
            80% { opacity: 1; cy: 52; }
            100% { opacity: 0; cy: 52; }
          }
          .sand-particle { animation: sand-fall 1.5s ease-in infinite; }
        `}</style>
        <g className="hourglass-group">
          <line x1="22" y1="12" x2="58" y2="12" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
          <line x1="22" y1="68" x2="58" y2="68" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
          <path d="M25 12 C25 12 22 28 40 40 C58 52 55 68 55 68 L25 68 C25 68 22 52 40 40 C58 28 55 12 55 12Z"
            fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M25 12 L55 12 C55 12 52 24 40 33 C28 24 25 12 25 12Z" fill="#f59e0b" opacity="0.8"/>
          <path d="M25 68 L55 68 C55 68 52 60 40 56 C28 60 25 68 25 68Z" fill="#f59e0b" opacity="0.4"/>
        </g>
        <circle className="sand-particle" cx="40" cy="36" r="1.5" fill="#d97706"/>
      </svg>
    </div>
    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
      Tu reserva expiró
    </h2>
    <p style={{ color: '#78716c', fontSize: '0.92rem', maxWidth: 300, lineHeight: 1.65, marginBottom: '2rem' }}>
      El tiempo para completar tu compra se agotó y los boletos fueron liberados. ¡Puedes intentarlo de nuevo!
    </p>
    <button
      onClick={onRetry}
      className="btn btn-primary btn-lg px-4"
      style={{ borderRadius: 10, boxShadow: '0 4px 14px rgba(13,110,253,0.25)' }}
    >
      Volver a seleccionar boletos →
    </button>
  </div>
)

// ─── Paso 4: Formulario de pago Stripe ───────────────────────────────────────
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
      confirmParams: { return_url: `${window.location.origin}/success` },
    })

    if (error) {
      setPaymentError(error.message ?? 'Ocurrió un error inesperado con el pago.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      <PaymentElement />
      {paymentError && <div className="alert alert-danger py-2 mb-0">{paymentError}</div>}
      <button
        type="submit"
        className="btn btn-primary w-100 btn-lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? 'Procesando pago, no cierres esta ventana...' : 'Confirmar y Pagar'}
      </button>
    </form>
  )
}

// ─── Indicador de pasos ───────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Correo', 'Datos', 'Reserva', 'Pago']
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        return (
          <div key={stepNum} className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32, height: 32, fontSize: 13,
                  backgroundColor: isDone ? '#198754' : isActive ? CONFIG.THEME.PRIMARY : '#dee2e6',
                  color: isDone || isActive ? '#fff' : '#6c757d',
                  transition: 'background-color 0.3s',
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <small
                className={`mt-1 ${isActive ? 'fw-semibold' : 'text-muted'}`}
                style={{ fontSize: 11, color: isActive ? CONFIG.THEME.PRIMARY : undefined }}
              >
                {label}
              </small>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="mb-3"
                style={{
                  width: 40, height: 2,
                  backgroundColor: isDone ? '#198754' : '#dee2e6',
                  transition: 'background-color 0.3s',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Tipo de paso ─────────────────────────────────────────────────────────────
type CheckoutStep = 1 | 2 | 3 | 4 | 'expired'

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, clearCart, addItem } = useCart()

  const [step, setStep] = useState<CheckoutStep>(1)

  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [expirationTime, setExpirationTime] = useState<string | null>(null)
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null)

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [wantsInvoice, setWantsInvoice] = useState(false)
  const [billing, setBilling] = useState<BillingDetails>({
    tax_id: '', legal_name: '', postal_code: '', address: '',
    neighborhood: '', city: '', state: '', tax_system: ''
  })

  const [colonias, setColonias] = useState<string[]>([])
  const [loadingCP, setLoadingCP] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prevenir cierre accidental si hay reserva o pago en proceso
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeReservationId || clientSecret) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [activeReservationId, clientSecret])

  // ── Helper: reconstruir carrito desde reservas del handshake ─────────────
  const reconstructCart = async (reservations: any[]) => {
    const eventId = reservations[0]?.event_id
    if (!eventId) return

    try {
      // Usamos el mismo endpoint que EventDetailPage
      const tiers = await getEventTiers(eventId)

      clearCart()

      for (const res of reservations) {
        const tier = tiers.find((t: any) => t.id === res.tier_id)
        if (!tier) {
          console.warn(`Tier ${res.tier_id} no encontrado en evento ${eventId}`)
          continue
        }
        // custom_donation_cents > 0 solo en tiers tipo DONATION
        const donationAmount = res.custom_donation_cents > 0
          ? res.custom_donation_cents
          : undefined

        addItem(tier, res.quantity, donationAmount)
      }

      // Aseguramos que el event_id quede en sessionStorage para createReservation
      sessionStorage.setItem('current_event_id', eventId)
    } catch (err) {
      // No bloqueamos el flujo si falla — el carrito quedará vacío visualmente
      // pero la reserva ya existe en backend y el pago puede completarse igual
      console.error('No se pudo reconstruir el carrito:', err)
    }
  }

  // ── Paso 1: verificar handshake ───────────────────────────────────────────
  const handleEmailNext = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const data = await getHandshake(email.trim(), CONFIG.PROJECT_ID)

      if (data && data.length > 0) {
        const firstRes = data[0]

        // 1. Restaurar datos de contacto
        setExpirationTime(firstRes.expires_at)
        setActiveReservationId(firstRes.id)
        setCustomerName(firstRes.customer_name || '')
        setContactNumber(firstRes.contact_phone || '')

        // 2. Reconstruir carrito con los tiers del evento
        await reconstructCart(data)

        // 3. Saltar directo al pago sin crear nueva reserva
        setStep(3)
        await preparePaymentSession(firstRes.id)
      } else {
        // Sin sesión previa → flujo normal
        setStep(2)
      }
    } catch (err: any) {
      const isExpired =
        err?.code === 'SESSION_EXPIRED' ||
        err?.message?.toLowerCase().includes('expir')

      if (isExpired) {
        setStep('expired')
      } else {
        console.error('Handshake error:', err)
        setStep(2)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Retry desde pantalla expirada ─────────────────────────────────────────
  const handleExpiredRetry = () => {
    clearCart()
    navigate('/', { replace: true })
  }

  // ── Paso 2 → 3: crear reserva y sesión de pago ───────────────────────────
  const handleContactNext = async () => {
    if (!customerName.trim()) {
      setError('Ingresa tu nombre.')
      return
    }
    if (!contactNumber.trim() || contactNumber.length < 8) {
      setError('Ingresa un número de contacto válido.')
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

    setError(null)
    setLoading(true)
    setStep(3)

    try {
      const reservation = await createReservation({
        project_id: CONFIG.PROJECT_ID,
        event_id: storedEventId,
        customer_email: email.trim(),
        customer_name: customerName.trim(),
        contact_phone: contactNumber.trim(),
        items: items.map((i) => ({
          tier_id: i.tier.id,
          quantity: i.quantity,
          donation_amount: i.tier.type === 'DONATION'
            ? (i.donationAmount || i.tier.min_donation_amount)
            : undefined
        })),
        billing_details: wantsInvoice ? billing : undefined
      })

      const firstData = reservation[0]
      if (!firstData || !firstData.id) throw new Error('No se pudo crear la reserva')

      if (firstData.expires_at) {
        setExpirationTime(firstData.expires_at)
        setActiveReservationId(firstData.id)
      }

      await preparePaymentSession(firstData.id)
    } catch (err: any) {
      setError(err.message ?? 'Error al procesar. Intenta de nuevo.')
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  // ── Crear checkout session → paso 4 ──────────────────────────────────────
  const preparePaymentSession = async (reservationId: string) => {
    setLoading(true)
    try {
      const session = await createCheckoutSession({
        reservation_id: reservationId,
        project_uuid: CONFIG.PROJECT_ID,
        customer_data: { email, name: customerName }
      })

      if (session.isFree) {
        clearCart()
        navigate('/success', {
          state: { sessionToken: session.session_token },
          replace: true
        })
        return
      }

      if (!session.clientSecret) throw new Error('Error al iniciar el proceso de pago.')
      setClientSecret(session.clientSecret)
      setStep(4)
    } catch (err: any) {
      setError(err.message ?? 'Error al preparar el pago.')
      // Quedarse en step 3 con botón de reintentar
    } finally {
      setLoading(false)
    }
  }

  // ── Timer agotado ─────────────────────────────────────────────────────────
  const handleTimerTimeout = () => setStep('expired')

  // ── Código postal ─────────────────────────────────────────────────────────
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
          ...prev, state, city: state,
          neighborhood: coloniasList.length === 1 ? coloniasList[0] : prev.neighborhood
        }))
      } catch {
        setColonias([])
      } finally {
        setLoadingCP(false)
      }
    }
  }

  // ── Carrito vacío sin sesión activa ───────────────────────────────────────
  if (totalItems === 0 && !clientSecret && !activeReservationId && step === 1) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">No tienes boletos en tu carrito.</p>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
          Ver eventos
        </button>
      </div>
    )
  }

  // ── Pantalla de sesión expirada ───────────────────────────────────────────
  if (step === 'expired') {
    return (
      <div className="container py-4" style={{ maxWidth: 520 }}>
        <SessionExpiredScreen onRetry={handleExpiredRetry} />
      </div>
    )
  }

  return (
    <div className="container py-4 position-relative" style={{ maxWidth: 900 }}>
      {expirationTime && (
        <TicketrakTimer expiresAt={expirationTime} onExpire={handleTimerTimeout} />
      )}

      <StepIndicator currentStep={step as number} />

      <div className="row g-4 justify-content-center">

        {/* Resumen lateral solo en paso 4 */}
        {step === 4 && (
          <div className="col-12 col-lg-5">
            
            <CartSummary />
          </div>
        )}

        <div className={`col-12 ${step === 4 ? 'col-lg-7' : 'col-lg-6'}`}>

          {/* ── PASO 1: Email ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title h5 mb-1">¿Cuál es tu correo?</h2>
                <p className="text-muted small mb-4">
                  Te enviaremos la confirmación y tus boletos aquí.
                </p>

                <div className="mb-4">
                  <CartSummary />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <button
                  className="btn btn-primary w-100 btn-lg mt-2"
                  onClick={handleEmailNext}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Verificando...
                    </>
                  ) : 'Continuar →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2: Datos de contacto ──────────────────────────────────── */}
          {step === 2 && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <button
                  className="btn btn-link text-decoration-none ps-0 mb-3"
                  onClick={() => { setStep(1); setError(null) }}
                >
                  ← Volver
                </button>
                <h2 className="card-title h5 mb-4">Datos de Contacto</h2>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombre Completo</label>
                  <input
                    className="form-control"
                    placeholder="Tu nombre"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Teléfono / WhatsApp</label>
                  <input
                    className="form-control"
                    placeholder="+525512345678"
                    maxLength={13}
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                  />
                </div>

                <div className="border-top pt-3 mt-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="wantsInvoice"
                      checked={wantsInvoice}
                      onChange={(e) => setWantsInvoice(e.target.checked)}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="wantsInvoice">
                      Requiero Factura (RFC)
                    </label>
                  </div>
                </div>

                {wantsInvoice && (
                  <div className="mt-3 d-flex flex-column gap-3">
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label">RFC</label>
                        <input
                          className="form-control"
                          placeholder="XAXX010101000"
                          value={billing.tax_id}
                          onChange={(e) => setBilling({ ...billing, tax_id: e.target.value.toUpperCase() })}
                          disabled={loading}
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
                            onChange={(e) => handlePostalCodeChange(e.target.value.replace(/\D/g, ''))}
                            disabled={loading}
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
                        onChange={(e) => setBilling({ ...billing, legal_name: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label">Estado</label>
                        <input
                          className={`form-control ${colonias.length > 0 ? 'bg-light' : ''}`}
                          readOnly={colonias.length > 0}
                          value={billing.state}
                          onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Colonia</label>
                        {colonias.length > 0 ? (
                          <select
                            className="form-select"
                            value={billing.neighborhood}
                            onChange={(e) => setBilling({ ...billing, neighborhood: e.target.value })}
                            disabled={loading}
                          >
                            <option value="">Selecciona...</option>
                            {colonias.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <input
                            className="form-control"
                            placeholder="Colonia"
                            value={billing.neighborhood}
                            onChange={(e) => setBilling({ ...billing, neighborhood: e.target.value })}
                            disabled={loading}
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
                        onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}

                <button
                  className="btn btn-primary w-100 btn-lg mt-4"
                  onClick={handleContactNext}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Preparando...
                    </>
                  ) : 'Reservar y continuar al pago →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: Procesando ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="card shadow-sm">
              <div className="card-body p-5 text-center">
                {loading ? (
                  <>
                    <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
                    <h5 className="mb-2">Preparando tu pago...</h5>
                    <p className="text-muted small">No cierres esta ventana.</p>
                  </>
                ) : error ? (
                  <>
                    <div className="text-danger mb-3" style={{ fontSize: '2.5rem' }}>✕</div>
                    <h5 className="mb-2">Ocurrió un problema</h5>
                    <p className="text-muted small mb-4">{error}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => activeReservationId && preparePaymentSession(activeReservationId)}
                      disabled={!activeReservationId}
                    >
                      Reintentar →
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* ── PASO 4: Pago con Stripe ────────────────────────────────────── */}
          {step === 4 && clientSecret && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 bg-light rounded">
                <h2 className="card-title h5 mb-4 text-center">Ingresa tu método de pago</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutPaymentForm />
                </Elements>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}