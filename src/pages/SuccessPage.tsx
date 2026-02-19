import { useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'
import { useFetch } from '@/hooks/useFetch'
import { getCheckoutStatus } from '@/services/api'
import { CONFIG } from '@/config'

export default function SuccessPage() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id') ?? ''

  const fetcher = useCallback(
    () => getCheckoutStatus(sessionId),
    [sessionId],
  )
  const { data, loading, error } = useFetch(fetcher, [sessionId])

  // Sin session_id en la URL — acceso directo
  if (!sessionId) {
    return (
      <div className="tk-success tk-success--invalid">
        <div className="tk-container tk-center">
          <p>Acceso inválido.</p>
          <Link to="/" className="tk-btn tk-btn--ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tk-success">
      <div className="tk-container tk-success__inner">
        {loading && <div className="tk-center"><Spinner size={56} /></div>}

        {error && (
          <div className="tk-success__card tk-success__card--error">
            <div className="tk-success__icon tk-success__icon--error">✕</div>
            <h1>Algo salió mal</h1>
            <p>{error}</p>
            <Link to="/" className="tk-btn tk-btn--ghost">Volver al inicio</Link>
          </div>
        )}

        {data?.status === 'complete' && (
          <div className="tk-success__card">
            <div className="tk-success__confetti" aria-hidden>
              {['🎫', '✨', '🎉', '🌟', '🎊'].map((e, i) => (
                <span key={i} style={{ animationDelay: `${i * 120}ms` }}>{e}</span>
              ))}
            </div>
            <div className="tk-success__icon">✓</div>
            <h1 className="tk-success__title">¡Tus boletos están en camino!</h1>
            <p className="tk-success__email">
              Los enviamos a <strong>{data.customer_email}</strong>
            </p>
            <p className="tk-success__hint">
              Revisa tu bandeja de entrada (y la carpeta de spam, por si acaso).
            </p>

            {CONFIG.ENABLE_VAULT && (
              <Link to="/vault" className="tk-btn tk-btn--primary">
                Ver mis boletos
              </Link>
            )}

            <Link to="/" className="tk-btn tk-btn--ghost" style={{ marginTop: '12px' }}>
              Ver más eventos
            </Link>
          </div>
        )}

        {data?.status === 'open' && (
          <div className="tk-success__card tk-success__card--pending">
            <div className="tk-success__icon tk-success__icon--pending">⏳</div>
            <h1>Pago pendiente</h1>
            <p>Tu pago aún no ha sido confirmado. Si completaste el pago, espera unos minutos.</p>
            <Link to="/" className="tk-btn tk-btn--ghost">Volver al inicio</Link>
          </div>
        )}

        {data?.status === 'expired' && (
          <div className="tk-success__card tk-success__card--error">
            <div className="tk-success__icon tk-success__icon--error">✕</div>
            <h1>Sesión expirada</h1>
            <p>La sesión de pago caducó. Por favor intenta de nuevo.</p>
            <Link to="/" className="tk-btn tk-btn--primary">Volver al inicio</Link>
          </div>
        )}
      </div>
    </div>
  )
}
