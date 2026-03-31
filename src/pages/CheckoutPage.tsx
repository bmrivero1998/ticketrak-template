import { useState, useEffect, FormEvent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

import { CartSummary } from '@/components/checkout/CartSummary'
import { useCart } from '@/context/CartContext'
import {
  createReservation,
  createCheckoutSession,
  getHandshake,
  getPublicSettings,
} from '@/services/api'

import { TicketrakTimer } from '@/components/checkout/CheckoutTimer'
import { Spinner } from '@/components/ui/Spinner'

// ─────────────────────────────────────────────
// Stripe Form
// ─────────────────────────────────────────────
const CheckoutPaymentForm = () => {
  const stripe = useStripe()
  const elements = useElements()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    })

    if (error) {
      setError(error.message || 'Error en el pago')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <PaymentElement />

      {error && <div className="alert alert-danger">{error}</div>}

      <button
        className="btn btn-primary btn-lg w-100 rounded-pill fw-bold"
        disabled={loading || !stripe}
      >
        {loading ? 'Procesando...' : 'Pagar ahora'}
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, clearCart } = useCart()

  // 🧠 BASE DEL SISTEMA
  const currentItem = items[0]
  const currentEventId = currentItem?.event_id
  const currentProjectId = currentItem?.project_id

  // 🚨 VALIDACIÓN CRÍTICA
  const eventIds = new Set(items.map((i) => i.event_id))

  // STATE
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [reservationId, setReservationId] = useState<string | null>(null)
  const [expirationTime, setExpirationTime] = useState<string | null>(null)

  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const [stripeConfig, setStripeConfig] = useState<any>(null)
  const [initializing, setInitializing] = useState(true)


  const [wantsInvoice, setWantsInvoice] = useState(false)

const [billing, setBilling] = useState({
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

  // ─────────────────────────────
  // VALIDAR MULTI EVENTO
  // ─────────────────────────────
  useEffect(() => {
    if (eventIds.size > 1) {
      setError('No puedes pagar múltiples eventos al mismo tiempo.')
    }
  }, [items])

  // ─────────────────────────────
  // STRIPE CONFIG DINÁMICO
  // ─────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!currentEventId) {
        setInitializing(false)
        return
      }

      try {
        const config = await getPublicSettings(currentEventId)

        setStripeConfig({
          key: config.stripe_public_key,
          account: config.stripe_account,
        })
      } catch {
        setError('Error cargando configuración de pago')
      } finally {
        setInitializing(false)
      }
    }

    init()
  }, [currentEventId])

  const stripePromise = useMemo(() => {
    if (!stripeConfig?.key) return null

    return loadStripe(stripeConfig.key, {
      stripeAccount: stripeConfig.account,
    })
  }, [stripeConfig])

  // ─────────────────────────────
  // STEP 1 - EMAIL
  // ─────────────────────────────
  const handleEmailNext = async () => {
    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }

    if (!currentProjectId) {
      setError('Carrito inválido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getHandshake(email, currentProjectId)

      if (data?.length) {
        const res = data[0]

        setCustomerName(res.customer_name || '')
        setContactNumber(res.contact_phone || '')
        setExpirationTime(res.expires_at)
        setReservationId(res.id)
         const eventId = data[0].event_id
        if (eventId) {
          sessionStorage.setItem('checkout_event_id', eventId)
        }
        setStep(3)
        await preparePayment(res.id)
      } else {
        setStep(2)
      }
    } catch {
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────
  // STEP 2 - RESERVATION
  // ─────────────────────────────
  const handleContactNext = async () => {
    
    const eventId = sessionStorage.getItem('current_event_id')
    if (!currentEventId || !currentProjectId) {
      setError('Evento inválido')
      return
    }

    if (wantsInvoice) {
      if (!billing.tax_id || !billing.legal_name || !billing.postal_code || !billing.address) {
        setError('Completa los datos fiscales obligatorios')
        return
      }
    }
  if (!eventId) {
    setError('Evento no encontrado')
    return
  }

  // 🔥 GUARDAR EVENTO PARA SUCCESS PAGE
  sessionStorage.setItem('checkout_event_id', eventId)


    setLoading(true)
    setStep(3)

    try {
      const reservation = await createReservation({
        project_id: currentProjectId,
        event_id: currentEventId,
        customer_email: email,
        customer_name: customerName,
        contact_phone: contactNumber,
        billing_details: wantsInvoice ? billing : undefined,
        items: items.map((i) => ({
          tier_id: i.tier.id,
          quantity: i.quantity,
          donation_amount:
            i.tier.type === 'DONATION'
              ? i.donationAmount || i.tier.min_donation_amount
              : undefined,
        })),
      })

      const res = reservation[0]

      setExpirationTime(res.expires_at)
      setReservationId(res.id)

      await preparePayment(res.id)
    } catch (err: any) {
      setError(err.message)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

const handlePostalCodeChange = async (cp: string) => {
  setBilling(prev => ({ ...prev, postal_code: cp }))

  if (cp.length === 5) {
    setLoadingCP(true)

    try {
      const res = await fetch(`https://api.zippopotam.us/mx/${cp}`)
      const data = await res.json()

      const places = data.places || []
      const coloniasList = places.map((p: any) => p['place name'])
      const state = places[0]?.state || ''

      setColonias(coloniasList)

      setBilling(prev => ({
        ...prev,
        state,
        city: state,
        neighborhood: coloniasList.length === 1 ? coloniasList[0] : prev.neighborhood
      }))

    } catch {
      setColonias([])
    } finally {
      setLoadingCP(false)
    }
  }
}


  // ─────────────────────────────
  // STEP 3 → 4 PAYMENT
  // ─────────────────────────────
  const preparePayment = async (resId: string) => {
    if (!currentProjectId) return

    try {
      const eventId = sessionStorage.getItem('current_event_id')
      if (eventId) {
        sessionStorage.setItem('checkout_event_id', eventId)
      }
      const session = await createCheckoutSession({
        reservation_id: resId,
        project_uuid: currentProjectId,
        customer_data: { email, name: customerName },
      })

      if (session.isFree) {
        clearCart()
        navigate('/success', {
          state: { sessionToken: session.session_token },
        })
        return
      }

      setClientSecret(session?.clientSecret || null)
      setStep(4)
    } catch (err: any) {
      setError(err.message)
      setStep(3)
    }
  }

  // ─────────────────────────────
  // UI STATES
  // ─────────────────────────────
  if (initializing) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <Spinner size={40} />
      </div>
    )
  }

  if (totalItems === 0 && !reservationId) {
    return (
      <div className="container py-5 text-center">
        <p>No tienes boletos</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Ver eventos
        </button>
      </div>
    )
  }

  // ─────────────────────────────
  // RENDER
  // ─────────────────────────────
  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      {expirationTime && (
        <TicketrakTimer
          expiresAt={expirationTime}
          onExpire={() => navigate('/')}
        />
      )}

      <div className="row g-4">

        {/* FORM */}
        <div className="col-lg-7">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="card p-4">
              <h5>Correo</h5>

              <input
                className="form-control mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && <p className="text-danger">{error}</p>}

              <button
                onClick={handleEmailNext}
                className="btn btn-primary w-100"
              >
                {loading ? 'Cargando...' : 'Continuar'}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
  <div className="card bg-dark border-secondary border-opacity-25 p-4 rounded-4 shadow-lg">
    <h2 className="h5 fw-bold text-white mb-4">Información</h2>

    {/* Nombre */}
    <div className="mb-3">
      <label className="text-muted small">Nombre</label>
      <input
        className="form-control bg-black text-white border-secondary"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
    </div>

    {/* Teléfono */}
    <div className="mb-3">
      <label className="text-muted small">Teléfono</label>
      <input
        className="form-control bg-black text-white border-secondary"
        value={contactNumber}
        onChange={(e) =>
          setContactNumber(e.target.value.replace(/\D/g, ''))
        }
      />
    </div>

    {/* FACTURACIÓN */}
    <div className="form-check mt-3">
      <input
        className="form-check-input"
        type="checkbox"
        checked={wantsInvoice}
        onChange={(e) => setWantsInvoice(e.target.checked)}
      />
      <label className="form-check-label text-white small">
        Requiero factura
      </label>
    </div>

    {wantsInvoice && (
      <div className="mt-3 d-flex flex-column gap-3">

        <div className="row g-2">
          <div className="col-6">
            <input
              className="form-control"
              placeholder="RFC"
              value={billing.tax_id}
              onChange={(e) =>
                setBilling({ ...billing, tax_id: e.target.value.toUpperCase() })
              }
            />
          </div>

          <div className="col-6 position-relative">
            <input
              className="form-control"
              placeholder="C.P."
              maxLength={5}
              value={billing.postal_code}
              onChange={(e) =>
                handlePostalCodeChange(e.target.value.replace(/\D/g, ''))
              }
            />
            {loadingCP && (
              <span className="position-absolute end-0 top-50 translate-middle-y pe-3 text-muted small">
                ...
              </span>
            )}
          </div>
        </div>

        <input
          className="form-control"
          placeholder="Razón social"
          value={billing.legal_name}
          onChange={(e) =>
            setBilling({ ...billing, legal_name: e.target.value })
          }
        />

        <div className="row g-2">
          <div className="col-6">
            <input
              className="form-control"
              placeholder="Estado"
              value={billing.state}
              readOnly={colonias.length > 0}
            />
          </div>

          <div className="col-6">
            {colonias.length > 0 ? (
              <select
                className="form-select"
                value={billing.neighborhood}
                onChange={(e) =>
                  setBilling({ ...billing, neighborhood: e.target.value })
                }
              >
                <option value="">Colonia</option>
                {colonias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                className="form-control"
                placeholder="Colonia"
                value={billing.neighborhood}
                onChange={(e) =>
                  setBilling({ ...billing, neighborhood: e.target.value })
                }
              />
            )}
          </div>
        </div>

        <input
          className="form-control"
          placeholder="Dirección"
          value={billing.address}
          onChange={(e) =>
            setBilling({ ...billing, address: e.target.value })
          }
        />
      </div>
    )}

    {error && <p className="text-danger small mt-2">{error}</p>}

    <button
      className="btn btn-primary w-100 btn-lg rounded-pill fw-bold mt-4"
      onClick={handleContactNext}
    >
      Continuar al pago
    </button>
  </div>
)}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="text-center py-5">
              <Spinner size={40} />
              <p>Preparando pago...</p>

              {error && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    reservationId && preparePayment(reservationId)
                  }
                >
                  Reintentar
                </button>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutPaymentForm />
            </Elements>
          )}
        </div>

        {/* RESUMEN */}
        <div className="col-lg-5">
          <CartSummary />
        </div>

      </div>
    </div>
  )
}