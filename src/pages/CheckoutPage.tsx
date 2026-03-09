import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createReservation, createCheckoutSession, getHandshake, getEventTiers } from '../services/api'
import { CONFIG } from '../config'
import type { BillingDetails } from '../types'

import { TicketrakTimer } from '../components/checkout/CheckoutTimer'
import { SessionExpiredScreen } from '../components/checkout/SessionExpiredScreen'
import { StepEmail } from '../components/checkout/steps/StepEmail'
import { StepContact } from '../components/checkout/steps/StepContact'
import { StepProcessing } from '../components/checkout/steps/StepProcessing'
import { StepPayment } from '../components/checkout/steps/StepPayment'
import { StepIndicator } from '../components/checkout/StepIndicator'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type CheckoutStep = 1 | 2 | 3 | 4 | 'expired'

// ─── Página principal (orquestador) ──────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, clearCart, addItem } = useCart()

  // ── Estado de navegación ──────────────────────────────────────────────────
  const [step, setStep] = useState<CheckoutStep>(1)

  // ── Estado de formulario ──────────────────────────────────────────────────
  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [wantsInvoice, setWantsInvoice] = useState(false)
  const [billing, setBilling] = useState<BillingDetails>({
    tax_id: '', legal_name: '', postal_code: '', address: '',
    neighborhood: '', city: '', state: '', tax_system: ''
  })

  // ── Estado de reserva / pago ──────────────────────────────────────────────
  const [expirationTime, setExpirationTime] = useState<string | null>(null)
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // ── Estado de UI ──────────────────────────────────────────────────────────
  const [colonias, setColonias] = useState<string[]>([])
  const [loadingCP, setLoadingCP] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Prevenir cierre accidental si hay reserva o pago activo ──────────────
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

  // ── Reconstruir carrito desde reservas del handshake ─────────────────────
  const reconstructCart = async (reservations: any[]) => {
    const eventId = reservations[0]?.event_id
    if (!eventId) return

    try {
      const tiers = await getEventTiers(eventId)
      clearCart()

      for (const res of reservations) {
        const tier = tiers.find((t: any) => t.id === res.tier_id)
        if (!tier) {
          console.warn(`Tier ${res.tier_id} no encontrado en evento ${eventId}`)
          continue
        }
        const donationAmount = res.custom_donation_cents > 0
          ? res.custom_donation_cents
          : undefined

        addItem(tier, res.quantity, donationAmount)
      }

      sessionStorage.setItem('current_event_id', eventId)
    } catch (err) {
      console.error('No se pudo reconstruir el carrito:', err)
    }
  }

  // ── Crear checkout session y avanzar al paso 4 ───────────────────────────
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
        navigate('/tickets/success', {
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
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 1 → 2: verificar handshake por email ────────────────────────────
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
        setExpirationTime(firstRes.expires_at)
        setActiveReservationId(firstRes.id)
        setCustomerName(firstRes.customer_name || '')
        setContactNumber(firstRes.contact_phone || '')

        await reconstructCart(data)
        setStep(3)
        await preparePaymentSession(firstRes.id)
      } else {
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

  // ── Paso 2 → 3: crear reserva ────────────────────────────────────────────
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

  // ── Retry desde pantalla expirada ────────────────────────────────────────
  const handleExpiredRetry = () => {
    clearCart()
    navigate('/', { replace: true })
  }

  // ── Código postal → colonias y estado ────────────────────────────────────
  const handlePostalCodeChange = async (cp: string) => {
    setBilling(prev => ({ ...prev, postal_code: cp }))
    if (cp.length !== 5) return

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

  // ── Carrito vacío sin sesión activa ───────────────────────────────────────
  if (totalItems === 0 && !clientSecret && !activeReservationId && step === 1) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">No tienes boletos en tu carrito.</p>
        <button className="btn btn-outline-primary" onClick={() => navigate('/tickets')}>
          Ver eventos
        </button>
      </div>
    )
  }

  // ── Sesión expirada ───────────────────────────────────────────────────────
  if (step === 'expired') {
    return (
      <div className="container py-4" style={{ maxWidth: 520 }}>
        <SessionExpiredScreen onRetry={handleExpiredRetry} />
      </div>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="container py-4 position-relative" style={{ maxWidth: step === 4 ? 900 : 540 }}>
      {expirationTime && (
        <TicketrakTimer expiresAt={expirationTime} onExpire={() => setStep('expired')} />
      )}

      <StepIndicator currentStep={step as number} />

      {step === 1 && (
        <StepEmail
          email={email}
          loading={loading}
          error={error}
          onEmailChange={(v:any) => { setEmail(v); setError(null) }}
          onNext={handleEmailNext}
        />
      )}

      {step === 2 && (
        <StepContact
          customerName={customerName}
          contactNumber={contactNumber}
          wantsInvoice={wantsInvoice}
          billing={billing}
          colonias={colonias}
          loadingCP={loadingCP}
          loading={loading}
          error={error}
          onCustomerNameChange={setCustomerName}
          onContactNumberChange={setContactNumber}
          onWantsInvoiceChange={setWantsInvoice}
          onBillingChange={setBilling}
          onPostalCodeChange={handlePostalCodeChange}
          onBack={() => { setStep(1); setError(null) }}
          onNext={handleContactNext}
        />
      )}

      {step === 3 && (
        <StepProcessing
          loading={loading}
          error={error}
          activeReservationId={activeReservationId}
          onRetry={preparePaymentSession}
        />
      )}

      {step === 4 && clientSecret && (
        <StepPayment clientSecret={clientSecret} />
      )}
    </div>
  )
}