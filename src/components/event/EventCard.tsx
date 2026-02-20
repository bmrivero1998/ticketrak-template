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
      to={`/events/${event.id}`}
      className="tk-event-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="tk-event-card__image-wrap">
        <img
          src={event.poster_image_url || 'https://placehold.co/400x560/111/333?text=Evento'}
          alt={event.name}
          className="tk-event-card__image"
          loading="lazy"
        />
        <div className="tk-event-card__overlay" />
      </div>

      <div className="tk-event-card__body">
        <p className="tk-event-card__date">{formatDateShort(event.start_date)}</p>
        <h3 className="tk-event-card__name">{event.name}</h3>
        <p className="tk-event-card__venue">{event.venue_name}</p>

        <span className="tk-event-card__cta">Ver boletos →</span>
      </div>
    </Link>
  )
}
