import { useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { Spinner } from '@/components/ui/Spinner'
import { TierSelector } from '@/components/event/TierSelector'
import { useFetch } from '@/hooks/useFetch'
import { getEventBySlug, getEventTiers } from '@/services/api'
import { formatDate } from '@/config'
import { useCart } from '@/context/CartContext'
import { PiNavigationArrow, PiMapPinFill, PiCalendarFill } from 'react-icons/pi';
import { BiMap, BiCompass, BiDirections } from 'react-icons/bi';
import { FaLocationDot } from 'react-icons/fa6';
import { MdOutlineLocationOn } from 'react-icons/md';

// Evita reverse-tabnabbing en links inyectados vía HTML del backend
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export default function EventDetailPage() {
  // Ahora extraemos el 'slug' de la URL en lugar del 'id'
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { totalItems } = useCart()

  // 1. Fetch del evento usando el slug
  const eventFetcher = useCallback(() => getEventBySlug(slug!), [slug])
  const { data: event, loading: loadingEvent, error: eventError } = useFetch(eventFetcher, [slug])

  // 2. Fetch de los tiers usando el ID real del evento (depende de que el evento ya haya cargado)
  const tiersFetcher = useCallback(() => {
    if (!event?.id) return Promise.resolve([])
    return getEventTiers(event.id)
  }, [event?.id])
  const { data: tiers, loading: loadingTiers } = useFetch(tiersFetcher, [event?.id])

  // 3. Guardar el ID real en la sesión para el flujo de Checkout
  useEffect(() => {
    if (event?.id) {
      sessionStorage.setItem('current_event_id', event.id)
    }
  }, [event?.id])

  if (loadingEvent) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner size={56} />
    </div>
  )

  if (eventError || !event) return (
    <div className="container py-5 text-center text-muted">
      <p>Evento no encontrado.</p>
      <button className="btn btn-outline-primary rounded-pill" onClick={() => navigate('/')}>
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
        <div 
          className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5"
          style={{ 
            background: `linear-gradient(to top, var(--bs-body-bg) 0%, rgba(0,0,0,0) 100%)`,
          }}
        >
          <button 
            className="btn btn-link text-white text-decoration-none p-0 mb-3 opacity-75" 
            onClick={() => navigate('/')}
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
      <small className="text-primary fw-bold text-uppercase mb-1 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
        <PiCalendarFill className="me-1" /> Fecha
      </small>
      <span className="fs-5 fw-semibold">{formatDate(event.start_date)}</span>
    </div>
    
    <div className="d-flex flex-column">
      <small className="text-primary fw-bold text-uppercase mb-1 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
        <FaLocationDot className="me-1" /> Lugar
      </small>
      {event.location_address ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${event.venue_name} ${event.location_address}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none d-inline-flex align-items-center gap-2 ubicacion-link"
          style={{ 
            color: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0d6efd';
            e.currentTarget.style.transform = 'translateX(3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'inherit';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span className="fs-5">
            {event.venue_name} <PiNavigationArrow className="mx-1" /> {event.location_address}
          </span>
          <small className="text-primary" style={{ fontSize: '0.7rem' }}>
            <MdOutlineLocationOn className="me-1" /> Ver mapa
          </small>
        </a>
      ) : (
        <span className="fs-5 text-muted">
          {event.venue_name || 'Ubicación no disponible'}
        </span>
      )}
    </div>
  </div>

  <div className="description-box mb-5">
    <h3 className="h6 text-uppercase fw-bold mb-3 opacity-50" style={{ letterSpacing: '1px' }}>
      Detalles
    </h3>
    <div
      className="fs-6 lh-lg opacity-75 html-content"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(
          event.description || 'Sin descripción disponible para este evento.',
          { ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'span'], ALLOWED_ATTR: ['href', 'target', 'rel'] }
        )
      }}
    />
                
    {(event.address || event.location_address) && (
      <div className="mt-4 p-4 rounded-4 shadow-sm border border-secondary border-opacity-10" style={{ background: 'linear-gradient(135deg, rgba(13,110,253,0.05) 0%, rgba(13,110,253,0.02) 100%)' }}>
        <div className="d-flex align-items-start gap-3">
          <div className="flex-shrink-0">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3">
              <PiMapPinFill className="text-primary" style={{ fontSize: '1.3rem' }} />
            </div>
          </div>
          <div className="flex-grow-1">
            <small className="d-block text-primary fw-bold mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>
              📍 UBICACIÓN EXACTA
            </small>
            <p className="mb-3 small fw-medium">
              {event.address || `${event.venue_name} - ${event.location_address}`}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {(() => {
                const searchQuery = encodeURIComponent(
                  event.address || `${event.venue_name} ${event.location_address}`
                );
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`;
                
                return (
                  <>
                    <a 
                      href={mapsUrl}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm rounded-pill px-4 d-inline-flex align-items-center gap-2"
                      style={{ transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <BiMap className="me-1" />
                      Abrir en Google Maps →
                    </a>
                    <a 
                      href={directionsUrl}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline-secondary btn-sm rounded-pill px-4 d-inline-flex align-items-center gap-2"
                    >
                      <BiCompass className="me-1" />
                      Cómo llegar
                    </a>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
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
                {loadingTiers || !event?.id ? <Spinner /> : 
                <TierSelector 
                tiers={tiers || []} 
                currency={event?.currency || 'MXN'} 
                event_id={event?.id} project_id={event?.project_id} 
                event_name={event?.name} event_poster={event?.poster_image_url} />}
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
              className="btn btn-light rounded-pill px-4 fw-bold shadow-sm"
              onClick={() => navigate('/checkout')}
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
        .ubicacion-link {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .html-content a {
    color: #0d6efd;
    text-decoration: none;
  }
  
  .html-content a:hover {
    text-decoration: underline;
  }
      `}</style>
    </div>
  )
}