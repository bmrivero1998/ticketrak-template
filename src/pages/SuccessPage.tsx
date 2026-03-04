/**
 * Componente SuccessPage.
 * Pantalla de resolución de pago. Maneja las redirecciones automáticas de Stripe
 * y el flujo de boletos gratuitos (bypass de Stripe).
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';

type PaymentStatus = 'success' | 'processing' | 'error' | 'loading';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 1. Validar si viene del bypass de boletos GRATIS (estado interno de React Router)
    if (location.state?.sessionToken) {
      setStatus('success');
      setMessage('¡Tus boletos han sido generados exitosamente! Los hemos enviado a tu correo electrónico.');
      return;
    }

    // 2. Validar si viene de un cobro de Stripe (parámetros en la URL)
    const redirectStatus = searchParams.get('redirect_status');

    switch (redirectStatus) {
      case 'succeeded':
        setStatus('success');
        setMessage('¡Pago procesado exitosamente! Tus boletos están en camino a tu correo electrónico.');
        break;
      case 'processing':
        setStatus('processing');
        setMessage('Tu pago se está procesando. Te notificaremos por correo cuando se confirme.');
        break;
      case 'requires_payment_method':
      case 'failed':
        setStatus('error');
        setMessage('El pago no pudo ser procesado o fue rechazado por el banco. Por favor, intenta con otro método de pago.');
        break;
      default:
        // Si alguien entra a la página /success directamente sin comprar nada, lo regresamos al inicio
        navigate('/');
        break;
    }
  }, [searchParams, location, navigate]);

  if (status === 'loading') {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted">Verificando el estado de tu orden...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5 text-center">
          
          {/* --- ICONO DINÁMICO --- */}
          <div className="mb-4">
            {status === 'success' && (
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            )}
            
            {status === 'processing' && (
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
            )}
          </div>

          {/* --- TEXTOS --- */}
          <h1 className="h3 fw-bold mb-3">
            {status === 'success' && '¡Orden Confirmada!'}
            {status === 'processing' && 'Procesando Pago'}
            {status === 'error' && 'Pago Fallido'}
          </h1>
          
          <p className="text-muted mb-4 fs-6">
            {message}
          </p>

          {/* --- BOTONES DE ACCIÓN --- */}
          {status === 'error' ? (
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={() => navigate(-1)} 
                className="btn btn-primary btn-lg w-100"
              >
                Intentar de nuevo
              </button>
              <Link to="/" className="btn btn-outline-secondary w-100">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <Link to="/" className="btn btn-primary btn-lg w-100 fw-semibold">
              Volver a la cartelera
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}