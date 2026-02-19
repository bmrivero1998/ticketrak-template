import { useCallback } from 'react'
import { EventCard } from '@/components/event/EventCard'
import { Spinner } from '@/components/ui/Spinner'
import { useFetch } from '@/hooks/useFetch'
import { getEvents } from '@/services/api'
import { CONFIG } from '@/config'

export default function HomePage() {
  const fetcher = useCallback(() => getEvents(), [])
  const { data: events, loading, error } = useFetch(fetcher)

  return (
    <div className="tk-home">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="tk-hero">
        <div className="tk-hero__grain" />
        <div className="tk-hero__content">
          <p className="tk-hero__eyebrow">Próximos Eventos</p>
          <h1 className="tk-hero__title">{CONFIG.BRAND_TAGLINE}</h1>
        </div>
        <div className="tk-hero__scroll-hint">
          <span>Explorar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── CARTELERA ──────────────────────────────────────────── */}
      <section className="tk-home__events">
        <div className="tk-container">
          {loading && (
            <div className="tk-center">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="tk-error">
              <p>No se pudieron cargar los eventos.</p>
              <p className="tk-error__detail">{error}</p>
            </div>
          )}

          {events && events.length === 0 && (
            <div className="tk-empty">
              <p>No hay eventos disponibles por el momento.</p>
            </div>
          )}

          {events && events.length > 0 && (
            <div className="tk-events-grid">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
