import { formatDateShort } from '@/config'

export function EventTicketsPanel({ event, onClose, onSelectTicket }: any) {
  if (!event) return null

  const active = event.tickets.filter(
    (t: any) => t.status !== 'USED' && t.status !== 'EXPIRED'
  )

  const used = event.tickets.filter(
    (t: any) => t.status === 'USED'
  )

  const expired = event.tickets.filter(
    (t: any) => t.status === 'EXPIRED'
  )

  
const transformTierCost = (cost: number, currency: string): string => {
    if (cost === 0) return 'Gratis'
    const fomatedCost = cost / 100 // Asumiendo que el costo viene en centavos
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(fomatedCost)
}

  const renderGroup = (title: string, list: any[], variant: string) => {
    if (!list.length) return null

    return (
      <div className="mb-4">
        <h6 className={`text-${variant} fw-bold mb-2`}>
          {title} ({list.length})
        </h6>

        <div className="d-flex flex-column gap-2">
          {list.map((t: any) => (
            <button
              key={t.ticket_id}
              className="btn btn-outline-light rounded-pill text-start d-flex justify-content-between align-items-center"
              onClick={() => onSelectTicket(t)}
            >
              <span>🎟️ {t.tier_name}</span>

              {/* 💡 Info real */}
              <small className="opacity-50">
                {t.tier_type === 'FREE' ? 'Gratis' : `${transformTierCost(t.amount_paid, 'MXN')}`}
              </small>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="panel-backdrop">
      <div className="panel">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4 className="fw-bold mb-1">{event.event_name}</h4>
            <small className="text-muted">
              {formatDateShort(event.event_date)} • {event.venue_name}
            </small>
          </div>

          <button onClick={onClose} className="btn-close btn-close-white" />
        </div>

        {/* IMAGEN */}
        <img
          src={event.poster_image_url}
          className="w-100 rounded mb-4"
          style={{ maxHeight: 180, objectFit: 'cover' }}
        />

        {/* GRUPOS */}
        {renderGroup('Activos', active, 'success')}
        {renderGroup('Usados', used, 'secondary')}
        {renderGroup('Expirados', expired, 'danger')}

      </div>

      <style>{`
        .panel-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: flex-end;
          z-index: 2000;
        }

        .panel {
          width: 420px;
          max-width: 100%;
          height: 100%;
          background: #0f0f0f;
          padding: 20px;
          overflow-y: auto;
          animation: slideIn 0.25s ease;
          border-left: 1px solid rgba(255,255,255,0.1);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}