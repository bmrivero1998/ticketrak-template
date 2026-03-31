import { useCallback, useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EventCard } from '@/components/event/EventCard'
import { Spinner } from '@/components/ui/Spinner'
import { getMarketplaceEvents } from '@/services/api'
import { CONFIG } from '@/config'
import type { EventSummary } from '@/types'
import { 
  BiSearch, 
  BiFilterAlt, 
  BiCalendar, 
  BiMap, 
  BiTrendingUp,
  BiChevronLeft,
  BiChevronRight,
  BiX,
  BiMusic
} from 'react-icons/bi'
import { FaCity, FaUser, FaTicketAlt, FaStar } from 'react-icons/fa'
import { MdLocationCity, MdLocalActivity } from 'react-icons/md'

type NormalizedEvent = EventSummary & {
  artist_name: string
  city: string
  location_address: string
}

export default function HomePage() {
  const [events, setEvents] = useState<NormalizedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedArtist, setSelectedArtist] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedVenue, setSelectedVenue] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'artist'>('date')
  
  const itemsPerPage = 12

  // ⏱ Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Normalizador de eventos
  const normalizeEvents = (data: EventSummary[]): NormalizedEvent[] => {
    return data.map((e) => ({
      ...e,
      artist_name: e.artist_name || 'Artista por confirmar',
      city: e.city || (e.location_address ? 'Ciudad no especificada' : 'Ubicación por confirmar'),
      location_address: e.location_address || e.venue_name || 'Lugar por confirmar',
    }))
  }

  // Obtener artistas únicos para filtro
  const uniqueArtists = useMemo(() => {
    const artists = events.map(e => e.artist_name).filter(a => a && a !== 'Artista por confirmar')
    return [...new Set(artists)]
  }, [events])

  // Obtener ciudades únicas para filtro
  const uniqueCities = useMemo(() => {
    const cities = events.map(e => e.city).filter(c => c && c !== 'Ubicación por confirmar' && c !== 'Ciudad no especificada')
    return [...new Set(cities)]
  }, [events])

  // Obtener venues únicos para filtro
  const uniqueVenues = useMemo(() => {
    const venues = events.map(e => e.venue_name).filter(v => v)
    return [...new Set(venues)]
  }, [events])

  // Filtrar y ordenar eventos
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events]
    
    // 🔥 Filtro por artista
    if (selectedArtist) {
      filtered = filtered.filter(e => e.artist_name === selectedArtist)
    }
    
    // Filtro por ciudad
    if (selectedCity) {
      filtered = filtered.filter(e => e.city === selectedCity)
    }
    
    // Filtro por venue
    if (selectedVenue) {
      filtered = filtered.filter(e => e.venue_name === selectedVenue)
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        return a.artist_name.localeCompare(b.artist_name)
      }
    })
    
    return filtered
  }, [events, selectedArtist, selectedCity, selectedVenue, sortBy])

  // Paginar eventos
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredAndSortedEvents.slice(start, end)
  }, [filteredAndSortedEvents, currentPage])

  // Actualizar total de páginas
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedEvents.length / itemsPerPage))
    setTotalEvents(filteredAndSortedEvents.length)
    // Resetear a página 1 si la actual es mayor que el total
    if (currentPage > Math.ceil(filteredAndSortedEvents.length / itemsPerPage)) {
      setCurrentPage(1)
    }
  }, [filteredAndSortedEvents, currentPage])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMarketplaceEvents(debouncedSearch, 100, 0)
      setEvents(normalizeEvents(data))
    } catch (err: any) {
      setError(err.message || 'Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const clearFilters = () => {
    setSelectedArtist('')
    setSelectedCity('')
    setSelectedVenue('')
    setSearchTerm('')
    setSortBy('date')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFiltersCount = [selectedArtist, selectedCity, selectedVenue, searchTerm].filter(Boolean).length

  return (
    <div className="bg-black min-vh-100">
      {/* HERO PREMIUM */}
      <section
        className="position-relative d-flex flex-column justify-content-center align-items-center text-center py-5 overflow-hidden"
        style={{
          minHeight: '55vh',
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 210, 255, 0.15), rgba(0,0,0,0.95) 70%), linear-gradient(135deg, #000 0%, #0a0a0a 100%)',
        }}
      >
        {/* Animación de partículas */}
        <div className="position-absolute w-100 h-100 overflow-hidden" style={{ opacity: 0.3, pointerEvents: 'none' }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="position-absolute rounded-circle"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                background: '#00d2ff',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>

        <div className="container position-relative z-1 animate-in">
          <div className="d-flex justify-content-center mb-4">
            <div className="glass-badge px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2">
              <FaTicketAlt className="text-primary-light" size={14} />
              <span className="text-uppercase tracking-widest text-primary-light fw-bold small">
                Explora {CONFIG.BRAND_NAME}
              </span>
            </div>
          </div>

          <h1 className="display-1 fw-black mb-4 text-white lh-1">
            VIVE LA{' '}
            <span className="text-gradient position-relative">
              MÚSICA
              <svg className="position-absolute bottom-0 start-0 w-100" style={{ height: '6px', transform: 'translateY(10px)' }} viewBox="0 0 100 6">
                <path d="M0,3 Q25,0 50,3 T100,3" stroke="url(#grad)" fill="none" strokeWidth="2"/>
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d2ff"/>
                    <stop offset="100%" stopColor="#3a7bd5"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="text-white-50 mx-auto mb-5 fs-5" style={{ maxWidth: '600px' }}>
            Descubre los mejores eventos, conciertos y festivales. 
            Vive experiencias inolvidables.
          </p>

          {/* 🔥 BUSCADOR */}
          <div className="mx-auto mt-2 search-container">
            <div className="input-group input-group-lg rounded-4 overflow-hidden bg-dark bg-opacity-50 border border-secondary" style={{ backdropFilter: 'blur(10px)' }}>
              <span className="input-group-text bg-transparent border-0 text-white-50 ps-4">
                <BiSearch size={20} />
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-0 text-white py-3 shadow-none"
                placeholder="Buscar por artista, evento o lugar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-link text-white-50 me-2"
                  onClick={() => setSearchTerm('')}
                >
                  <BiX size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="d-flex justify-content-center gap-4 mt-5 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <FaStar className="text-warning" />
              <span className="text-white small">+100 Eventos</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <FaUser className="text-primary-light" />
              <span className="text-white small">+50 Artistas</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <MdLocationCity className="text-success" />
              <span className="text-white small">+20 Ciudades</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="py-5">
        <div className="container">
          {/* Header con controles */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="h2 mb-0 text-white fw-black d-flex align-items-center gap-2">
                <MdLocalActivity className="text-primary-light" />
                PRÓXIMAS FECHAS
              </h2>
              <div className="h-1 w-25 bg-gradient mt-2" style={{ height: '3px', background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)' }}></div>
            </div>
            
            <div className="d-flex gap-3 align-items-center flex-wrap">
              {/* Selector de orden */}
              <select
                className="form-select form-select-sm bg-dark text-white border-secondary rounded-pill px-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ width: 'auto' }}
              >
                <option value="date">Ordenar por fecha</option>
                <option value="name">Ordenar por nombre</option>
                <option value="artist">Ordenar por artista</option>
              </select>
              
              {/* Botón filtros */}
              <button
                className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 transition-all ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <BiFilterAlt size={16} />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="badge bg-primary text-white rounded-pill ms-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* Contador de resultados */}
              <div className="text-white-50 small">
                <span className="text-white fw-bold">{totalEvents}</span> eventos
              </div>
            </div>
          </div>

          {/* 🔥 PANEL DE FILTROS */}
          {showFilters && (
            <div className="mb-4 p-4 rounded-4 animate-slideDown" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-white mb-0 fw-bold">Filtrar por:</h6>
                {activeFiltersCount > 0 && (
                  <button
                    className="btn btn-sm btn-link text-primary text-decoration-none"
                    onClick={clearFilters}
                  >
                    Limpiar todos
                  </button>
                )}
              </div>
              
              <div className="row g-3">
                {/* Filtro por Artista */}
                {uniqueArtists.length > 0 && (
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 d-flex align-items-center gap-1">
                      <FaUser size={12} /> Artista
                    </label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary rounded-pill"
                      value={selectedArtist}
                      onChange={(e) => {
                        setSelectedArtist(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">Todos los artistas</option>
                      {uniqueArtists.map(artist => (
                        <option key={artist} value={artist}>{artist}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Filtro por Ciudad */}
                {uniqueCities.length > 0 && (
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 d-flex align-items-center gap-1">
                      <FaCity size={12} /> Ciudad
                    </label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary rounded-pill"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">Todas las ciudades</option>
                      {uniqueCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Filtro por Recinto */}
                {uniqueVenues.length > 0 && (
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 d-flex align-items-center gap-1">
                      <BiMap size={12} /> Recinto
                    </label>
                    <select
                      className="form-select form-select-sm bg-dark text-white border-secondary rounded-pill"
                      value={selectedVenue}
                      onChange={(e) => {
                        setSelectedVenue(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      <option value="">Todos los recintos</option>
                      {uniqueVenues.map(venue => (
                        <option key={venue} value={venue}>{venue}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {/* Filtros activos como badges */}
              {activeFiltersCount > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top border-secondary border-opacity-25">
                  {selectedArtist && (
                    <span className="badge bg-primary bg-opacity-20 text-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                      <FaUser size={10} /> {selectedArtist}
                      <BiX role="button" onClick={() => setSelectedArtist('')} style={{ cursor: 'pointer' }} />
                    </span>
                  )}
                  {selectedCity && (
                    <span className="badge bg-info bg-opacity-20 text-info rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                      <FaCity size={10} /> {selectedCity}
                      <BiX role="button" onClick={() => setSelectedCity('')} style={{ cursor: 'pointer' }} />
                    </span>
                  )}
                  {selectedVenue && (
                    <span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                      <BiMap size={10} /> {selectedVenue}
                      <BiX role="button" onClick={() => setSelectedVenue('')} style={{ cursor: 'pointer' }} />
                    </span>
                  )}
                  {searchTerm && (
                    <span className="badge bg-secondary bg-opacity-20 text-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                      <BiSearch size={10} /> "{searchTerm}"
                      <BiX role="button" onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }} />
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
              <Spinner size={50} />
              <p className="mt-3 text-white-50 small">Cargando eventos increíbles...</p>
            </div>
          )}

          {/* ERROR */}
          {error && !loading && (
            <div className="alert alert-danger text-center rounded-4">
              <BiX size={24} className="me-2" />
              {error}
              <br />
              <button
                className="btn btn-sm btn-light mt-2 rounded-pill px-4"
                onClick={fetchEvents}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* LISTA DE EVENTOS */}
          {!loading && !error && (
            <>
              {paginatedEvents.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <BiMusic size={64} className="text-white-50" />
                  </div>
                  <h4 className="text-white">No encontramos eventos</h4>
                  <p className="text-white-50 mb-4">
                    {searchTerm || selectedArtist || selectedCity || selectedVenue
                      ? "No hay eventos que coincidan con tus filtros"
                      : "Pronto habrá nuevos eventos disponibles"}
                  </p>
                  {(searchTerm || selectedArtist || selectedCity || selectedVenue) && (
                    <button
                      className="btn btn-outline-primary rounded-pill px-4"
                      onClick={clearFilters}
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {paginatedEvents.map((event, i) => (
                      <div className="col" key={event.id}>
                        <EventCard event={event} index={i} />
                      </div>
                    ))}
                  </div>

                  {/* PAGINACIÓN */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-5 pt-3">
                      <button
                        className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center transition-all"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <BiChevronLeft size={20} />
                      </button>
                      
                      <div className="d-flex gap-2 mx-2">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = idx + 1
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx
                          } else {
                            pageNum = currentPage - 2 + idx
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center transition-all ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                              style={{ width: '40px', height: '40px' }}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      
                      <button
                        className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center transition-all"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <BiChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <style>{`
        .fw-black { font-weight: 900; }
        .text-primary-light { color: #00d2ff; }
        .tracking-widest { letter-spacing: 2px; }
        
        .text-gradient {
          background: linear-gradient(45deg, #00d2ff, #3a7bd5, #00d2ff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
        
        @keyframes shine {
          to { background-position: 200% center; }
        }
        
        .glass-badge {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .search-container {
          max-width: 650px;
        }
        
        .animate-in {
          animation: fadeInUp 0.8s ease both;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        ::placeholder {
          color: rgba(255,255,255,0.3);
        }
        
        .form-select, .form-control {
          transition: all 0.2s ease;
        }
        
        .form-select:focus, .form-control:focus {
          border-color: #00d2ff;
          box-shadow: 0 0 0 2px rgba(0, 210, 255, 0.25);
        }
        
        .btn-outline-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
        }
        
        .badge {
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}