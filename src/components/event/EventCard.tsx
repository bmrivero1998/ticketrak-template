import { Link } from 'react-router-dom'
import type { EventSummary } from '../../types'
import { formatDateShort } from '../../config'

interface Props {
  event: EventSummary
  index?: number
}

export function EventCard({ event, index = 0 }: Props) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="card h-100 text-decoration-none text-reset border-0 shadow-sm overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="position-relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <img
          src={event.poster_image_url || 'https://placehold.co/400x560/111/333?text=Evento'}
          alt={event.name}
          className="w-100 h-100 object-fit-cover"
          loading="lazy"
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }}
        />
      </div>

      <div className="card-body d-flex flex-column gap-1 pt-3">
        <p className="text-primary small fw-semibold mb-0">{formatDateShort(event.start_date)}</p>
        <h3 className="card-title h6 fw-bold mb-0">{event.name}</h3>
        <p className="text-muted small mb-0">{event.venue_name}</p>
        <span className="text-primary small fw-semibold mt-2">Ver boletos →</span>
      </div>
    </Link>
  )
}