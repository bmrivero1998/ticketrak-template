import { useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { TierSelector } from '../components/event/TierSelector'
import { useFetch } from '../hooks/useFetch'
import { getEvent, getEventTiers } from '../services/api'
import { formatDate } from '../config'
import { useCart } from '../context/CartContext'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { totalItems } = useCart()

  useEffect(() => {
    if (id) sessionStorage.setItem('current_event_id', id)
  }, [id])

  const eventFetcher = useCallback(() => getEvent(id!), [id])
  const tiersFetcher = useCallback(() => getEventTiers(id!), [id])

  const { data: event, loading: loadingEvent, error: eventError } = useFetch(eventFetcher, [id])
  const { data: tiers, loading: loadingTiers } = useFetch(tiersFetcher, [id])

  if (loadingEvent) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner size={56} />
    </div>
  )

  if (eventError || !event) return (
    <div className="container py-5 text-center text-muted">
      <p>Evento no encontrado.</p>
      <button className="btn btn-outline-primary rounded-pill" onClick={() => navigate('/tickets')}>
        Volver a cartelera
      </button>
    </div>
  )

  return (
    <div className="animate-in">
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <div className="position-relative w-100 overflow-hidden" style={{ height: '55vh', minHeight: '380px' }}>
        <img
          src={event.poster_image_url || 'https://placehold.co/1200x800/111/333?text=Evento'}
          alt={event.name}
          className="w-100 h-100 object-fit-cover shadow-lg"
        />
        {/* Gradiente que usa el color de fondo de tu CONFIG */}
        <div 
          className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5"
          style={{ 
            background: `linear-gradient(to top, var(--bs-body-bg) 0%, rgba(0,0,0,0) 100%)`,
          }}
        >
          <button 
           id="btn_tracking_event_back"
            className="btn btn-link text-white text-decoration-none p-0 mb-3 opacity-75" 
            onClick={() => navigate('/tickets')}
          >
            <small className="fw-bold">← VOLVER</small>
          </button>
          <h1 className="display-4 fw-bold mb-0 text-white" style={{ letterSpacing: '-1px' }}>{event.name}</h1>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────── */}
      <div className="container mt-4">
        <div className="row g-5">
          
          {/* Info del Evento */}
          <div className="col-lg-7">
            <div className="d-flex flex-wrap gap-4 mb-5 pb-4 border-bottom border-secondary border-opacity-25">
              <div className="d-flex flex-column">
                <small className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Fecha</small>
                <span className="fs-5">{formatDate(event.start_date)}</span>
              </div>
              <div className="d-flex flex-column">
                <small className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Lugar</small>
                <span className="fs-5">{event.venue_name}</span>
              </div>
            </div>

            <div className="description-box mb-5">
              <h3 className="h6 text-uppercase fw-bold mb-3 opacity-50" style={{ letterSpacing: '1px' }}>Detalles</h3>
              {event.description
                ? <div
                    className="event-description fs-6 lh-lg opacity-75"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                : <p className="fs-6 lh-lg opacity-75">Sin descripción disponible para este evento.</p>
              }  
              {event.address && (
                <div className="mt-4 p-3 rounded-3 border border-secondary border-opacity-10 bg-secondary bg-opacity-10">
                  <small className="d-block text-primary fw-bold mb-1">UBICACIÓN</small>
                  <p className="mb-2 small">{event.address}</p>
                  {event.map_url && (
                    <a href={event.map_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                      Abrir Mapa →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selector de Tickets */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: '2rem' }}>
              <div className="p-4 rounded-4 border border-secondary border-opacity-25 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <h2 className="h5 fw-bold mb-4 d-flex align-items-center">
                   <span className="text-primary me-2">🎟️</span> Boletos
                </h2>
                {loadingTiers ? <Spinner /> : <TierSelector tiers={tiers || []} />}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CTA FLOTANTE (Cápsula Metritrak) ────────────────────── */}
      {totalItems > 0 && (
        <div className="fixed-bottom d-flex justify-content-center pb-4 px-3" style={{ zIndex: 1100 }}>
          <div 
            className="rounded-pill shadow-lg d-flex align-items-center justify-content-between px-4 py-2 w-100"
            style={{ 
              maxWidth: '450px', 
              backgroundColor: 'var(--bs-primary)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="d-flex flex-column">
              <span className="fw-bold fs-5">{totalItems} {totalItems === 1 ? 'boleto' : 'boletos'}</span>
              <small className="opacity-75" style={{ fontSize: '0.65rem' }}>Listos para checkout</small>
            </div>
            <button
             id={`btn_tracking_checkout_start_${id}`}
              className="btn btn-light rounded-pill px-4 fw-bold shadow-sm"
              onClick={() => navigate('/tickets/checkout')}
            >
              Comprar ahora
            </button>
          </div>
        </div>
      )}

      <style>{`
        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .border-opacity-10 { border-color: rgba(var(--bs-primary-rgb), 0.1) !important; }
         .animate-in { animation: fadeIn 0.5s ease-out; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .border-opacity-10 { border-color: rgba(var(--bs-primary-rgb), 0.1) !important; }

  /* ── Estilos para HTML inyectado desde el editor ── */
  .event-description h1,
  .event-description h2,
  .event-description h3 { font-weight: 600; margin: 1em 0 0.4em; }
  .event-description p { margin-bottom: 0.6em; }
  .event-description a { color: var(--bs-primary); text-decoration: underline; }
  .event-description strong { font-weight: 700; }
  .event-description em { font-style: italic; }
  .event-description u { text-decoration: underline; }
  .event-description s { text-decoration: line-through; }
  .event-description ul, .event-description ol { padding-left: 1.5rem; margin-bottom: 0.75em; }
  .event-description li { margin-bottom: 0.25em; }
  .event-description blockquote {
    border-left: 3px solid var(--bs-primary);
    padding-left: 1em;
    margin: 0.75em 0;
    opacity: 0.8;
  }
  .event-description pre {
    background: rgba(0,0,0,0.2);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.85em;
    overflow-x: auto;
  }
  .event-description img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
  .event-description table { width: 100%; border-collapse: collapse; margin: 0.75em 0; }
  .event-description td, .event-description th {
    border: 1px solid rgba(255,255,255,0.15);
    padding: 0.5rem 0.75rem;
  }
      `}</style>
    </div>
  )
}