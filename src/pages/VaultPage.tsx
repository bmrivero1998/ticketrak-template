import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyTickets } from '@/services/api'
import { Spinner } from '@/components/ui/Spinner'
import { formatDateShort, formatEventDate } from '@/config'
import { VaultTicketModal } from '@/components/tickets/VaultTicketModal'
import { EventTicketsPanel } from '@/components/tickets/EventTicketsPanel'
import { VaultChatsPanel } from '@/components/tickets/VaultChatsPanel'
import { EventDataVault } from '@/types'

export default function VaultPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'tickets' | 'chats'>('tickets')
  const [events, setEvents] = useState<EventDataVault[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'FINISHED'>('ALL')

  const loadTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyTickets()
      setEvents(data?.events || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('MT_FAN_TOKEN')
    navigate('/')
  }

  // 🔍 FILTRO — siempre filtra sobre todos los eventos, nunca bloquea el render
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchSearch =
        !search.trim() ||
        ev.event_name.toLowerCase().includes(search.toLowerCase()) ||
        ev.venue_name.toLowerCase().includes(search.toLowerCase())

      const matchFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && ev.status !== 'FINISHED') ||
        (filter === 'FINISHED' && ev.status === 'FINISHED')

      return matchSearch && matchFilter
    })
  }, [events, search, filter])

  const hasActiveFilters = search.trim() !== '' || filter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setFilter('ALL')
  }

  // El tab de Chats es independiente de si el fan tiene boletos o no, así
  // que se muestra siempre — solo el contenido de "Boletos" respeta los
  // estados de loading/error/vacío del fetch de tickets.
  if (activeTab === 'chats') {
    return (
      <div className="container py-4 vault-page">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');
          .vault-page { font-family: 'Barlow', sans-serif; }
          .vault-title { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: 0.02em; line-height: 1; margin: 0; }
          .vault-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
          .vault-tab { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 100px; padding: 8px 18px; border: 1.5px solid rgba(255,255,255,0.18); background: transparent; color: rgba(255,255,255,0.55); cursor: pointer; transition: all 0.15s; }
          .vault-tab:hover { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.85); }
          .vault-tab.active { background: #fff; border-color: #fff; color: #111; }
          .filter-pill { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 100px !important; padding: 7px 16px !important; border: 1.5px solid rgba(255,255,255,0.18) !important; background: transparent !important; color: rgba(255,255,255,0.55) !important; }
          .filter-pill.active { background: #fff !important; border-color: #fff !important; color: #111 !important; }
          .vault-loading { min-height: 40vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,0.5); font-size: 14px; }
          .vault-empty-state { min-height: 40vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; color: #fff; }
          .vault-empty-icon { font-size: 52px; margin-bottom: 16px; line-height: 1; }
          .vault-empty-state h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
          .vault-no-results { text-align: center; padding: 48px 20px; color: rgba(255,255,255,0.4); }
          .vault-no-results-icon { font-size: 36px; margin-bottom: 12px; }
          .vault-no-results h5 { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        `}</style>

        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
          <h1 className="vault-title">Mis Chats</h1>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>

        <div className="vault-tabs">
          <button className="vault-tab" onClick={() => setActiveTab('tickets')}>
            Boletos
          </button>
          <button className="vault-tab active">Chats</button>
        </div>

        <VaultChatsPanel />
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vault-loading">
        <Spinner size={44} />
        <p>Cargando tus boletos…</p>
      </div>
    )
  }

  // ── Error de red ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="vault-empty-state">
        <div className="vault-empty-icon">⚠️</div>
        <h4>Algo salió mal</h4>
        <p className="text-muted">{error}</p>
        <div className="d-flex gap-2 justify-content-center mt-3">
          <button onClick={loadTickets} className="btn btn-primary rounded-pill px-4">
            Reintentar
          </button>
          <button onClick={() => navigate('/')} className="btn btn-outline-light rounded-pill px-4">
            Ir a cartelera
          </button>
        </div>
      </div>
    )
  }

  // ── Sin boletos en absoluto ───────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <div className="vault-empty-state">
        <div className="vault-empty-icon">🎟️</div>
        <h4>Aún no tienes boletos</h4>
        <p className="text-muted">Explora la cartelera y consigue el tuyo.</p>
        <div className="d-flex gap-2 justify-content-center mt-2">
          <button onClick={() => navigate('/')} className="btn btn-primary rounded-pill px-4">
            Ver cartelera
          </button>
          <button onClick={() => setActiveTab('chats')} className="btn btn-outline-light rounded-pill px-4">
            Ver mis chats
          </button>
        </div>
      </div>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');

        .vault-page {
          font-family: 'Barlow', sans-serif;
        }

        /* Loading */
        .vault-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: rgba(255,255,255,0.5);
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
        }

        /* Empty states */
        .vault-empty-state {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          color: #fff;
          font-family: 'Barlow', sans-serif;
        }
        .vault-empty-icon {
          font-size: 52px;
          margin-bottom: 16px;
          line-height: 1;
        }
        .vault-empty-state h4 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        /* Header */
        .vault-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 1;
          margin: 0;
        }
        .vault-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin: 4px 0 0;
        }

        /* Search */
        .vault-search {
          background: rgba(255,255,255,0.07) !important;
          border: 1.5px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .vault-search:focus {
          border-color: rgba(255,255,255,0.35) !important;
          box-shadow: none !important;
          background: rgba(255,255,255,0.09) !important;
        }
        .vault-search::placeholder { color: rgba(255,255,255,0.35) !important; }

        /* Filter pills */
        .filter-pill {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 100px !important;
          padding: 7px 16px !important;
          border: 1.5px solid rgba(255,255,255,0.18) !important;
          background: transparent !important;
          color: rgba(255,255,255,0.55) !important;
          transition: all 0.15s !important;
        }
        .filter-pill:hover {
          border-color: rgba(255,255,255,0.4) !important;
          color: rgba(255,255,255,0.85) !important;
        }
        .filter-pill.active {
          background: #fff !important;
          border-color: #fff !important;
          color: #111 !important;
        }

        /* Results count */
        .results-label {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .clear-filters {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-decoration: underline;
          font-family: 'Barlow', sans-serif;
        }
        .clear-filters:hover { color: #fff; }

        /* Event cards */
        .event-card {
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          cursor: pointer;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.18);
        }

        .event-card-img {
          position: relative;
          height: 170px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .event-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .event-card:hover .event-card-img img {
          transform: scale(1.04);
        }
        .event-card-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%);
        }

        .event-status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .event-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .event-card-date {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 6px;
        }
        .event-card-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 4px;
        }
        .event-card-venue {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0;
        }

        .btn-ver-boletos {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          padding: 9px 18px;
          background: transparent;
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .btn-ver-boletos:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
          color: #fff;
        }
        .btn-ver-boletos .ticket-count {
          background: rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 2px 8px;
          font-size: 12px;
        }

        /* Logout */
        .btn-logout {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1.5px solid rgba(239,68,68,0.4);
          border-radius: 100px;
          padding: 8px 18px;
          background: transparent;
          color: rgba(239,68,68,0.7);
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-logout:hover {
          border-color: rgb(239,68,68);
          color: rgb(239,68,68);
          background: rgba(239,68,68,0.08);
        }

        /* No results inline */
        .vault-no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px 20px;
          color: rgba(255,255,255,0.4);
          font-family: 'Barlow', sans-serif;
        }
        .vault-no-results-icon { font-size: 36px; margin-bottom: 12px; }
        .vault-no-results h5 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          margin-bottom: 6px;
        }
      `}</style>

      <div className="container py-4 vault-page">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
          <div>
            <h1 className="vault-title">Mis Boletos</h1>
            <p className="vault-subtitle">
              {events.length} {events.length === 1 ? 'evento' : 'eventos'} en tu colección
            </p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>

        <div className="d-flex gap-2 mb-4">
          <button className="filter-pill btn active">Boletos</button>
          <button className="filter-pill btn" onClick={() => setActiveTab('chats')}>
            Chats
          </button>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text" style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRight: 'none',
                color: 'rgba(255,255,255,0.4)',
                borderRadius: '100px 0 0 100px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar evento o venue…"
                className="form-control vault-search"
                style={{ borderLeft: 'none', borderRadius: '0 100px 100px 0' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-7 d-flex gap-2 justify-content-md-end flex-wrap">
            {(['ALL', 'ACTIVE', 'FINISHED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-pill btn ${filter === f ? 'active' : ''}`}
              >
                {f === 'ALL' ? 'Todos' : f === 'ACTIVE' ? 'Activos' : 'Finalizados'}
              </button>
            ))}
          </div>
        </div>

        {/* Contador + limpiar filtros */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="results-label">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'resultado' : 'resultados'}
          </span>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* GRID */}
        <div className="row g-3">
          {filteredEvents.length === 0 ? (
            // ← Empty state INLINE — no rompe la página ni oculta header/filtros
            <div className="col-12">
              <div className="vault-no-results">
                <div className="vault-no-results-icon">🔍</div>
                <h5>Sin resultados</h5>
                <p style={{ fontSize: 13, margin: '0 0 12px' }}>
                  Ningún evento coincide con tu búsqueda.
                </p>
                <button className="clear-filters" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          ) : (
            filteredEvents.map((ev: EventDataVault) => (
              <div key={ev.event_id} className="col-12 col-sm-6 col-lg-4">
                <div className="event-card" onClick={() => setSelectedEvent(ev)}>

                  {/* Imagen */}
                  <div className="event-card-img">
                    <img src={ev.poster_image_url} alt={ev.event_name} />
                    <span className={`event-status-badge ${ev.status === 'FINISHED' ? 'bg-secondary' : 'bg-success'}`}>
                      {ev.status === 'FINISHED' ? 'Finalizado' : 'Activo'}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="event-card-body">
                    <div className="event-card-date">{formatEventDate(ev.event_date)}</div>
                    <div className="event-card-name">{ev.event_name}</div>
                    <p className="event-card-venue">{ev.venue_name}</p>

                    <button className="btn-ver-boletos" onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev) }}>
                      <span>Ver boletos</span>
                      <span className="ticket-count">{ev.tickets.length}</span>
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* PANEL EVENTO */}
      <EventTicketsPanel
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSelectTicket={(ticket: any) => setSelectedTicket(ticket)}
      />

      {/* MODAL TICKET */}
      <VaultTicketModal
        isOpen={!!selectedTicket}
        ticket={selectedTicket}
        event={selectedEvent}
        onClose={() => setSelectedTicket(null)}
      />
    </>
  )
}