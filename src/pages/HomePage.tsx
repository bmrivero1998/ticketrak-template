import { useCallback, useState, useMemo } from 'react'
// --- FIX: Rutas relativas ---
import { EventCard } from '../components/event/EventCard'
import { Spinner } from '../components/ui/Spinner'
import { useFetch } from '../hooks/useFetch'
import { getEvents } from '../services/api'
import { CONFIG } from '../config'

export default function HomePage() {
  const fetcher = useCallback(() => getEvents(), [])
  const { data: events, loading, error } = useFetch(fetcher)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterVenue, setFilterVenue] = useState('all')

  const filteredEvents = useMemo(() => {
    if (!events) return []
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesVenue = filterVenue === 'all' || event.venue_name === filterVenue
      return matchesSearch && matchesVenue
    })
  }, [events, searchTerm, filterVenue])

  const venues = useMemo(() => {
    if (!events) return []
    return Array.from(new Set(events.map(e => e.venue_name)))
  }, [events])

  return (
    <div className="animate-in">
      {/* ── HERO AJUSTADO (Padding reducido para evitar el vacío bajo el Nav) ── */}
      <section
        className="position-relative d-flex flex-column justify-content-center align-items-center text-center py-4 overflow-hidden"
        style={{ 
          minHeight: '25vh', // Reducido de 35vh
          background: `radial-gradient(circle at top right, rgba(var(--bs-primary-rgb), 0.1), transparent), var(--bs-body-bg)` 
        }}
      >
        <div className="container position-relative z-1">
          <p className="text-primary fw-bold small text-uppercase mb-2 tracking-widest">
            {CONFIG.BRAND_NAME}
          </p>
          <h1 className="display-4 fw-bold mb-3 text-white" style={{ letterSpacing: '-1.5px' }}>
            {CONFIG.BRAND_TAGLINE}
          </h1>
          
          <div className="mx-auto mt-3" style={{ maxWidth: '500px' }}>
            <div className="input-group shadow-lg border-0 rounded-pill overflow-hidden bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input 
                type="text" 
                className="form-control bg-transparent border-0 text-white py-2 shadow-none fs-6" 
                placeholder="Busca tu evento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-4">
        <div className="container">
          
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-10 pb-3">
            <div className="d-flex align-items-center gap-3">
              <span className="small text-muted text-uppercase fw-bold">Recinto:</span>
              <select 
                className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-25 rounded-pill px-3"
                style={{ width: 'auto' }}
                value={filterVenue}
                onChange={(e) => setFilterVenue(e.target.value)}
              >
                <option value="all">Todos</option>
                {venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <div className="small text-muted">
              <span className="text-white fw-bold">{filteredEvents.length}</span> eventos encontrados
            </div>
          </div>

          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
              <Spinner size={40} />
            </div>
          )}

          {error && (
            <div className="alert bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger text-center py-4 rounded-4">
              <p className="small mb-0">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-5 opacity-50">
                  <p>No hay eventos disponibles con estos filtros.</p>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {filteredEvents.map((event, i) => (
                    <div className="col animate-in" key={event.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* FOOTER ELIMINADO: Se usa el del TicketLayout global en App.tsx */}

      <style>{`
        .animate-in { 
          animation: fadeInUp 0.5s ease-out both; 
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-select:focus {
          border-color: var(--bs-primary);
          box-shadow: none;
        }
        ::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
      `}</style>
    </div>
  )
}