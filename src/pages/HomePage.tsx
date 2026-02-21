import { useCallback, useState, useMemo } from 'react'
import { EventCard } from '@/components/event/EventCard'
import { Spinner } from '@/components/ui/Spinner'
import { useFetch } from '@/hooks/useFetch'
import { getEvents } from '@/services/api'
import { CONFIG } from '@/config'

export default function HomePage() {
  const fetcher = useCallback(() => getEvents(), [])
  const { data: events, loading, error } = useFetch(fetcher)

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVenue, setFilterVenue] = useState('all')

  // Lógica de Filtrado (Se siente Ticketmaster porque es instantánea)
  const filteredEvents = useMemo(() => {
    if (!events) return []
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesVenue = filterVenue === 'all' || event.venue_name === filterVenue
      return matchesSearch && matchesVenue
    })
  }, [events, searchTerm, filterVenue])

  // Obtener recintos únicos para el select de filtros
  const venues = useMemo(() => {
    if (!events) return []
    return Array.from(new Set(events.map(e => e.venue_name)))
  }, [events])

  return (
    <div className="animate-in">
      {/* ── HERO MINIMALISTA (Estilo Editorial) ────────────────────── */}
      <section
        className="position-relative d-flex flex-column justify-content-center align-items-center text-center py-5 overflow-hidden"
        style={{ 
          minHeight: '35vh', 
          background: `radial-gradient(circle at top right, rgba(var(--bs-primary-rgb), 0.15), transparent), var(--bs-body-bg)` 
        }}
      >
        <div className="container position-relative z-1">
          <p className="text-primary fw-bold small text-uppercase mb-2 tracking-widest">
            {CONFIG.BRAND_NAME} Presenta
          </p>
          <h1 className="display-3 fw-bold mb-4 text-white" style={{ letterSpacing: '-2px' }}>
            {CONFIG.BRAND_TAGLINE}
          </h1>
          
          {/* BARRA DE BÚSQUEDA TIPO "GLOBAL SEARCH" */}
          <div className="mx-auto mt-4" style={{ maxWidth: '600px' }}>
            <div className="input-group input-group-lg shadow-lg border-0 rounded-pill overflow-hidden bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1) !important' }}>
              <span className="input-group-text bg-transparent border-0 text-muted ps-4">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input 
                type="text" 
                className="form-control bg-transparent border-0 text-white py-3 shadow-none fs-6" 
                placeholder="Busca por nombre de evento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN DE FILTROS Y CONTENIDO ─────────────────────────── */}
      <section className="py-4 mt-n2">
        <div className="container">
          
          {/* BARRA DE FILTROS SECUNDARIOS */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-5 border-bottom border-secondary border-opacity-10 pb-4">
            <div className="d-flex align-items-center gap-3">
              <span className="small text-muted text-uppercase fw-bold letter-spacing-1">Filtrar por:</span>
              <select 
                className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-25 rounded-pill px-3"
                style={{ width: 'auto' }}
                value={filterVenue}
                onChange={(e) => setFilterVenue(e.target.value)}
              >
                <option value="all">Todos los recintos</option>
                {venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <div className="small text-muted">
              Mostrando <span className="text-white fw-bold">{filteredEvents.length}</span> eventos
            </div>
          </div>

          {/* ESTADOS DE CARGA Y ERROR */}
          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
              <Spinner size={48} />
              <p className="mt-3 text-muted small">Cargando experiencias...</p>
            </div>
          )}

          {error && (
            <div className="alert bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger text-center py-5 rounded-4">
              <h5 className="fw-bold">Error de conexión</h5>
              <p className="small mb-0 opacity-75">{error}</p>
            </div>
          )}

          {/* GRID DE EVENTOS (Look Ticketmaster pero con tu estilo) */}
          {!loading && !error && (
            <>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-5 opacity-50">
                  <svg width="64" height="64" className="mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="fs-5">No encontramos eventos que coincidan.</p>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-5">
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

      <style>{`
        .letter-spacing-1 { letter-spacing: 1px; }
        .tracking-widest { letter-spacing: 3px; }
        .animate-in { 
          animation: fadeInUp 0.6s ease-out both; 
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
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