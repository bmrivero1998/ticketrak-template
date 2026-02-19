import { useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'
import { TierSelector } from '@/components/event/TierSelector'
import { useFetch } from '@/hooks/useFetch'
import { getEvent, getEventTiers } from '@/services/api'
import { formatDate } from '@/config'
import { useCart } from '@/context/CartContext'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { totalItems } = useCart()

  // Guardamos el event_id en sessionStorage para que CheckoutPage lo use al crear la reserva
  useEffect(() => {
    if (id) sessionStorage.setItem('current_event_id', id)
  }, [id])

  const eventFetcher = useCallback(() => getEvent(id!), [id])
  const tiersFetcher = useCallback(() => getEventTiers(id!), [id])

  const { data: event, loading: loadingEvent, error: eventError } = useFetch(eventFetcher, [id])
  const { data: tiers, loading: loadingTiers } = useFetch(tiersFetcher, [id])

  if (loadingEvent) {
    return <div className="tk-center tk-page-loader"><Spinner size={56} /></div>
  }

  if (eventError || !event) {
    return (
      <div className="tk-error tk-container">
        <p>Evento no encontrado.</p>
        <button className="tk-btn tk-btn--ghost" onClick={() => navigate('/')}>
          Volver a cartelera
        </button>
      </div>
    )
  }

  return (
    <div className="tk-event-detail">
      {/* ── HERO IMAGEN ────────────────────────────────────────── */}
      <div className="tk-event-detail__hero">
        <img
          src={event.poster_url || 'https://placehold.co/1200x500/111/333?text=Evento'}
          alt={event.name}
          className="tk-event-detail__hero-img"
        />
        <div className="tk-event-detail__hero-overlay" />
        <div className="tk-event-detail__hero-content">
          <button className="tk-btn-back" onClick={() => navigate('/')}>
            ← Volver
          </button>
          <h1 className="tk-event-detail__title">{event.name}</h1>
        </div>
      </div>

      {/* ── CONTENIDO ──────────────────────────────────────────── */}
      <div className="tk-container tk-event-detail__body">
        <div className="tk-event-detail__meta">
          <div className="tk-event-detail__meta-item">
            <span className="tk-event-detail__meta-label">Fecha</span>
            <span className="tk-event-detail__meta-value">{formatDate(event.start_date)}</span>
          </div>
          <div className="tk-event-detail__meta-item">
            <span className="tk-event-detail__meta-label">Lugar</span>
            <span className="tk-event-detail__meta-value">{event.venue_name}</span>
          </div>
          {event.address && (
            <div className="tk-event-detail__meta-item">
              <span className="tk-event-detail__meta-label">Dirección</span>
              <span className="tk-event-detail__meta-value">
                {event.address}
                {event.map_url && (
                  <a href={event.map_url} target="_blank" rel="noopener noreferrer" className="tk-map-link">
                    {' '}Ver mapa →
                  </a>
                )}
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="tk-event-detail__desc">{event.description}</p>
        )}

        {/* ── TIERS ──────────────────────────────────────────── */}
        <div className="tk-event-detail__tiers-section">
          <h2 className="tk-event-detail__tiers-title">Selecciona tus boletos</h2>
          {loadingTiers ? (
            <div className="tk-center"><Spinner /></div>
          ) : tiers ? (
            <TierSelector tiers={tiers} />
          ) : null}
        </div>

        {/* ── CTA FLOTANTE ───────────────────────────────────── */}
        {totalItems > 0 && (
          <div className="tk-sticky-cta">
            <span className="tk-sticky-cta__count">
              {totalItems} {totalItems === 1 ? 'boleto' : 'boletos'}
            </span>
            <button
              className="tk-btn tk-btn--primary tk-btn--lg"
              onClick={() => navigate('/checkout')}
            >
              Ir al pago →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
