import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

type PaymentStatus = 'success' | 'processing' | 'error' | 'loading';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { removeEventCart } = useCart();

  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState('');

  const hasClearedRef = useRef(false);

  const clearCorrectEvent = () => {
    const eventId = sessionStorage.getItem('checkout_event_id')

    if (eventId && !hasClearedRef.current) {
      removeEventCart(eventId)
      sessionStorage.removeItem('checkout_event_id') // 🔥 limpieza extra
      hasClearedRef.current = true
    }
  }

  useEffect(() => {
    // 🟢 GRATIS
    if (location.state?.sessionToken) {
      setStatus('success');
      setMessage('¡Tus boletos han sido generados exitosamente!');

      clearCorrectEvent()
      return;
    }

    const redirectStatus = searchParams.get('redirect_status');

    switch (redirectStatus) {
      case 'succeeded':
        setStatus('success');
        setMessage('¡Pago exitoso! Tus boletos fueron enviados.');

        clearCorrectEvent()
        break;

      case 'processing':
        setStatus('processing');
        setMessage('Tu pago se está procesando.');
        break;

      case 'requires_payment_method':
      case 'failed':
        setStatus('error');
        setMessage('El pago falló.');
        break;

      default:
        navigate('/');
        break;
    }
  }, [searchParams, location, navigate]);

  if (status === 'loading') {
    return <div className="text-center py-5">Cargando...</div>;
  }

  return (
    <div className="container py-5 text-center">
      <h1>
        {status === 'success' && '✅ Éxito'}
        {status === 'processing' && '⏳ Procesando'}
        {status === 'error' && '❌ Error'}
      </h1>

      <p>{message}</p>

      <Link to="/" className="btn btn-primary mt-3">
        Volver
      </Link>
    </div>
  );
}