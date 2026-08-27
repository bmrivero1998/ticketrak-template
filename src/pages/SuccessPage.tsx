import { useEffect, useState, useRef } from 'react'
import {
  useSearchParams,
  useLocation,
  useNavigate,
  Link,
} from 'react-router-dom'

import { useCart } from '@/context/CartContext'
import { capturePayPalOrder } from '@/services/api'
import { BiCheckCircle } from 'react-icons/bi'
import { FaClock } from 'react-icons/fa'
import { IoCloseCircle } from 'react-icons/io5' // Para XCircle
import { PiTicketLight } from 'react-icons/pi' // Para Ticket
import { LiaHandsHelpingSolid } from 'react-icons/lia' // Para HeartHandshake
import { HiOutlineArrowLeft } from 'react-icons/hi' // Para ArrowLeft
import { GiSparkles } from 'react-icons/gi'

type PaymentStatus = 'success' | 'processing' | 'error' | 'loading'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { removeEventCart } = useCart()
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [message, setMessage] = useState('')
  const hasClearedRef = useRef(false)

  const clearCorrectEvent = () => {
    const eventId = sessionStorage.getItem('checkout_event_id')

    if (eventId && !hasClearedRef.current) {
      removeEventCart(eventId)
      sessionStorage.removeItem('checkout_event_id')
      hasClearedRef.current = true
    }
  }

  useEffect(() => {
    const run = async () => {
      if (location.state?.sessionToken) {
        setStatus('success')
        setMessage(
          'Tus boletos fueron generados correctamente y enviados a tu correo.'
        )
        clearCorrectEvent()
        return
      }

      // PayPal: vuelve con ?token=<ppOrderId>&PayerID=... tras la aprobación.
      // Hay que capturar la orden explícitamente para liberar el cobro.
      const ppOrderId = searchParams.get('token')
      const payerId = searchParams.get('PayerID')

      if (ppOrderId && payerId) {
        const projectUuid = sessionStorage.getItem('checkout_pp_project_uuid')

        if (!projectUuid) {
          setStatus('error')
          setMessage(
            'No pudimos confirmar tu pago con PayPal. Contáctanos si el cargo se realizó.'
          )
          return
        }

        try {
          await capturePayPalOrder(ppOrderId, projectUuid)
          sessionStorage.removeItem('checkout_pp_project_uuid')
          setStatus('success')
          setMessage(
            'Tu pago con PayPal fue confirmado y tus boletos ya están en camino.'
          )
          clearCorrectEvent()
        } catch (err: any) {
          setStatus('error')
          setMessage(
            err?.message ||
              'No pudimos capturar tu pago con PayPal. Contáctanos si el cargo se realizó.'
          )
        }
        return
      }

      // Mercado Pago: vuelve con ?collection_status=approved|pending|rejected
      const mpStatus = searchParams.get('collection_status')

      if (mpStatus) {
        switch (mpStatus) {
          case 'approved':
            setStatus('success')
            setMessage(
              'Tu pago fue confirmado y tus boletos ya están en camino.'
            )
            clearCorrectEvent()
            break

          case 'pending':
          case 'in_process':
            setStatus('processing')
            setMessage(
              'Estamos confirmando tu pago. Esto puede tardar unos minutos.'
            )
            break

          default:
            setStatus('error')
            setMessage(
              'No pudimos procesar el pago. No te preocupes, puedes intentarlo nuevamente.'
            )
            break
        }
        return
      }

      // Nuestro propio parámetro de failure_url/pending_url (cancelación en
      // PayPal, o fallback de Mercado Pago si no llegó collection_status).
      const ownStatus = searchParams.get('status')

      if (ownStatus) {
        switch (ownStatus) {
          case 'pending':
            setStatus('processing')
            setMessage(
              'Estamos confirmando tu pago. Esto puede tardar unos minutos.'
            )
            break

          default:
            setStatus('error')
            setMessage(
              'No pudimos procesar el pago. No te preocupes, puedes intentarlo nuevamente.'
            )
            break
        }
        return
      }

      // Stripe: vuelve con ?redirect_status=succeeded|processing|...
      const redirectStatus = searchParams.get('redirect_status')

      switch (redirectStatus) {
        case 'succeeded':
          setStatus('success')
          setMessage(
            'Tu pago fue confirmado y tus boletos ya están en camino.'
          )
          clearCorrectEvent()
          break

        case 'processing':
          setStatus('processing')
          setMessage(
            'Estamos confirmando tu pago. Esto puede tardar unos minutos.'
          )
          break

        case 'requires_payment_method':
        case 'failed':
          setStatus('error')
          setMessage(
            'No pudimos procesar el pago. No te preocupes, puedes intentarlo nuevamente.'
          )
          break

        default:
          navigate('/')
          break
      }
    }

    run()
  }, [searchParams, location, navigate, removeEventCart])

  if (status === 'loading') {
    return (
      <div className="success-page">
        <div className="success-card loading-card">
          <div className="loader-ring"></div>
          <h2>Verificando pago...</h2>
          <p>Estamos validando tu transacción.</p>
        </div>
      </div>
    )
  }

  const statusConfig = {
    success: {
      icon: <BiCheckCircle size={72} />,
      title: '¡Pago Exitoso!',
      color: 'success',
    },
    processing: {
      icon: <FaClock size={72} />,
      title: 'Pago en Proceso',
      color: 'processing',
    },
    error: {
      icon: <IoCloseCircle size={72} />,
      title: 'No se pudo completar el pago',
      color: 'error',
    },
  }

  const current = statusConfig[status]

  return (
    <div className="success-page">
      <div className={`success-card ${current.color}`}>
        <div className="card-glow"></div>

        <div className={`status-icon ${current.color}`}>
          {current.icon}
        </div>

        <h1>{current.title}</h1>

        <p className="message">{message}</p>

        {status === 'success' && (
          <>
            <div className="success-box">
              <div className="success-box-icon">
                <PiTicketLight size={18} />
              </div>
              <div>
                <strong>Boletos enviados</strong>
                <p>
                  Revisa tu correo electrónico y también tu carpeta de spam.
                </p>
              </div>
            </div>

            <div className="success-box">
              <div className="success-box-icon">
                <GiSparkles size={18} />
              </div>
              <div>
                <strong>Sin cargos ocultos</strong>
                <p>
                  En Ticketrak el precio del boleto es limpio:
                  lo que ves es lo que pagas.
                </p>
              </div>
            </div>

            <div className="donation-card">
              <div className="donation-header">
                <LiaHandsHelpingSolid size={22} />
                <strong>Apoya a Ticketrak</strong>
              </div>
              <p>
                Creamos una ticketera sin fees abusivos,
                transparente y enfocada en artistas,
                organizadores y fans.
              </p>
              <p className="donation-small">
                Si quieres ayudarnos a seguir creciendo,
                puedes dejarnos una donación ❤️
              </p>
              <div className="donation-embed">
                <stripe-buy-button
                  buy-button-id="buy_btn_1TbZKyLlq8dRY3gU2SQwffSZ"
                  publishable-key="pk_live_51Rjrm1Llq8dRY3gU3hr6InTOsEvhoKdySXQp5Mx1duUZBRoFK9DkhTw1OGQTTIaNi0rYsvtUkhunpU4QVKypQu1v00uCU3SVUV"
                ></stripe-buy-button>
              </div>
            </div>
          </>
        )}

        {status === 'processing' && (
          <div className="info-banner">
            Si el cobro ya apareció en tu banco,
            solo espera unos minutos más.
          </div>
        )}

        {status === 'error' && (
          <div className="info-banner error-banner">
            Tu banco no realizó el cargo o el método
            de pago fue rechazado.
          </div>
        )}

        <div className="actions">
          <Link to="/" className={`main-button ${current.color}`}>
            <HiOutlineArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>

      <style>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background:
            radial-gradient(circle at top, rgba(99,102,241,0.12), transparent 35%),
            linear-gradient(to bottom, #f8fafc, #eef2ff);
        }

        .success-card {
          position: relative;
          width: 100%;
          max-width: 720px;
          background: white;
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow:
            0 10px 40px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 30%);
        }

        .status-icon {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-icon.success {
          background: rgba(34,197,94,0.12);
          color: #16a34a;
        }

        .status-icon.processing {
          background: rgba(245,158,11,0.12);
          color: #d97706;
        }

        .status-icon.error {
          background: rgba(239,68,68,0.12);
          color: #dc2626;
        }

        h1 {
          text-align: center;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: #111827;
        }

        .message {
          text-align: center;
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 28px;
        }

        .success-box {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 16px;
          border-radius: 16px;
          background: #f9fafb;
          border: 1px solid #ececec;
          margin-bottom: 14px;
        }

        .success-box-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(99,102,241,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          flex-shrink: 0;
        }

        .success-box strong {
          display: block;
          margin-bottom: 4px;
          color: #111827;
        }

        .success-box p {
          margin: 0;
          color: #6b7280;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .donation-card {
          margin-top: 28px;
          padding: 24px;
          border-radius: 24px;
          background:
            linear-gradient(
              135deg,
              rgba(99,102,241,0.06),
              rgba(168,85,247,0.08)
            );
          border: 1px solid rgba(99,102,241,0.12);
        }

        .donation-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          margin-bottom: 14px;
          color: #111827;
        }

        .donation-card p {
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 12px;
        }

        .donation-small {
          font-size: 0.92rem;
          color: #6b7280;
        }

        .donation-embed {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }

        .info-banner {
          margin-top: 24px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(245,158,11,0.1);
          color: #92400e;
          text-align: center;
          font-weight: 500;
        }

        .error-banner {
          background: rgba(239,68,68,0.1);
          color: #991b1b;
        }

        .actions {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }

        .main-button {
          height: 52px;
          padding: 0 24px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .main-button.success {
          background: #16a34a;
          color: white;
        }

        .main-button.processing {
          background: #d97706;
          color: white;
        }

        .main-button.error {
          background: #dc2626;
          color: white;
        }

        .main-button:hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }

        .loading-card {
          text-align: center;
          padding: 60px 32px;
        }

        .loader-ring {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 4px solid #e5e7eb;
          border-top-color: #4f46e5;
          margin: 0 auto 20px;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .success-card {
            padding: 28px 20px;
            border-radius: 24px;
          }

          h1 {
            font-size: 1.6rem;
          }

          .status-icon {
            width: 90px;
            height: 90px;
          }
        }
      `}</style>
    </div>
  )
}