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
      <div className="container py-5 text-center">
        <p className="text-muted">Acceso inválido.</p>
        <Link to="/" className="btn btn-outline-primary">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">

          {loading && (
            <div className="d-flex justify-content-center py-5">
              <Spinner size={56} />
            </div>
          )}

          {error && (
            <div className="card border-danger shadow-sm text-center p-4">
              <div className="display-4 mb-3">✕</div>
              <h1 className="h4 text-danger mb-2">Algo salió mal</h1>
              <p className="text-muted mb-4">{error}</p>
              <Link to="/" className="btn btn-outline-primary">Volver al inicio</Link>
            </div>
          )}

          {data?.status === 'complete' && (
            <div className="card shadow-sm text-center p-4">
              <div className="fs-2 mb-2" aria-hidden>
                {['🎫', '✨', '🎉', '🌟', '🎊'].map((e, i) => (
                  <span key={i}>{e}</span>
                ))}
              </div>
              <div className="display-6 text-success mb-3">✓</div>
              <h1 className="h4 fw-bold mb-2">¡Tus boletos están en camino!</h1>
              <p className="text-muted mb-1">
                Los enviamos a <strong>{data.customer_email}</strong>
              </p>
              <p className="text-muted small mb-4">
                Revisa tu bandeja de entrada (y la carpeta de spam, por si acaso).
              </p>

              <div className="d-flex flex-column gap-2">
                {CONFIG.ENABLE_VAULT && (
                  <Link to="/vault" className="btn btn-primary">
                    Ver mis boletos
                  </Link>
                )}
                <Link to="/" className="btn btn-outline-secondary">
                  Ver más eventos
                </Link>
              </div>
            </div>
          )}

          {data?.status === 'open' && (
            <div className="card border-warning shadow-sm text-center p-4">
              <div className="display-4 mb-3">⏳</div>
              <h1 className="h4 text-warning mb-2">Pago pendiente</h1>
              <p className="text-muted mb-4">Tu pago aún no ha sido confirmado. Si completaste el pago, espera unos minutos.</p>
              <Link to="/" className="btn btn-outline-primary">Volver al inicio</Link>
            </div>
          )}

          {data?.status === 'expired' && (
            <div className="card border-danger shadow-sm text-center p-4">
              <div className="display-4 mb-3">✕</div>
              <h1 className="h4 text-danger mb-2">Sesión expirada</h1>
              <p className="text-muted mb-4">La sesión de pago caducó. Por favor intenta de nuevo.</p>
              <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}