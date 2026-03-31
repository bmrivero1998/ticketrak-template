import { Link } from 'react-router-dom'
import type { EventSummary } from '@/types'
import { formatDateShort } from '@/config'

interface Props {
  event: EventSummary
  index?: number
}

export function EventCard({ event, index = 0 }: Props) {
  return (
    <Link
      to={`/evento/${event.slug}`} 
      className="card h-100 text-decoration-none text-reset border-0 shadow-lg overflow-hidden group transition-all duration-300 hover-lift"
      style={{ 
        animation: `fadeInUp 0.6s ease forwards ${index * 0.1}s`,
        opacity: 0,
        backgroundColor: '#111',
        borderRadius: '20px'
      }}
    >
      {/* Contenedor de Imagen con Efecto Zoom */}
      <div className="position-relative overflow-hidden" style={{ aspectRatio: '10/13' }}>
        <img
          src={event.poster_image_url || 'https://placehold.co/400x560/111/333?text=Evento'}
          alt={event.name}
          className="w-100 h-100 object-fit-cover transition-transform duration-500 card-img-hover"
          loading="lazy"
        />
        
        {/* Badge de Género / Categoría (MVP) */}
        {event.genre && (
          <div className="position-absolute top-0 start-0 m-3">
            <span className="badge glass-badge text-uppercase tracking-wider px-3 py-2">
              {event.genre}
            </span>
          </div>
        )}

        {/* Overlay Gradiente Dinámico */}
        <div
          className="position-absolute bottom-0 start-0 w-100 p-3 d-flex flex-column justify-content-end"
          style={{ 
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)' 
          }}
        >
          {/* Ciudad y Fecha (MVP Context) */}
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="text-primary-light fw-bold x-small">
              {event.city?.toUpperCase() || 'MÉXICO'}
            </span>
            <span className="text-white-50 x-small">•</span>
            <span className="text-white-50 x-small fw-medium">
              {formatDateShort(event.start_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Info del Evento */}
      <div className="card-body p-3 d-flex flex-column gap-1 bg-black">
        {/* Artista en pequeño (MVP) */}
        {event.artist_name && (
          <p className="text-muted x-small text-uppercase tracking-widest mb-0 fw-semibold">
            {event.artist_name}
          </p>
        )}
        
        <h3 className="h6 fw-bold text-white mb-1 text-truncate">
          {event.name}
        </h3>
        
        <div className="d-flex align-items-center justify-content-between mt-auto">
          <p className="text-white-50 small mb-0 d-flex align-items-center gap-1">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
            {event.venue_name}
          </p>
          <p className="text-white-50 small mb-0">{event.location_address}</p>
          <div className="btn-arrow">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <style>{`
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .card-img-hover { transform: scale(1); }
        .hover-lift:hover .card-img-hover { transform: scale(1.1); }
        
        .glass-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.65rem;
          color: #fff;
          border-radius: 50px;
        }

        .x-small { font-size: 0.7rem; letter-spacing: 0.05rem; }
        .text-primary-light { color: #00d2ff; }

        .btn-arrow {
          color: #00d2ff;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .hover-lift:hover .btn-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Link>
  )
}