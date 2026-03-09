// ─── Pantalla de sesión expirada ──────────────────────────────────────────────
interface SessionExpiredScreenProps {
  onRetry: () => void
}

export const SessionExpiredScreen = ({ onRetry }: SessionExpiredScreenProps) => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  }}>
    <div style={{ width: 80, height: 80, marginBottom: '1.5rem' }}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <style>{`
          @keyframes hourglass-spin {
            0%, 40% { transform-origin: 40px 40px; transform: rotate(0deg); }
            60%, 100% { transform-origin: 40px 40px; transform: rotate(180deg); }
          }
          .hourglass-group { animation: hourglass-spin 3s ease-in-out infinite; }
          @keyframes sand-fall {
            0% { opacity: 0; cy: 36; }
            20% { opacity: 1; }
            80% { opacity: 1; cy: 52; }
            100% { opacity: 0; cy: 52; }
          }
          .sand-particle { animation: sand-fall 1.5s ease-in infinite; }
        `}</style>
        <g className="hourglass-group">
          <line x1="22" y1="12" x2="58" y2="12" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
          <line x1="22" y1="68" x2="58" y2="68" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
          <path d="M25 12 C25 12 22 28 40 40 C58 52 55 68 55 68 L25 68 C25 68 22 52 40 40 C58 28 55 12 55 12Z"
            fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M25 12 L55 12 C55 12 52 24 40 33 C28 24 25 12 25 12Z" fill="#f59e0b" opacity="0.8"/>
          <path d="M25 68 L55 68 C55 68 52 60 40 56 C28 60 25 68 25 68Z" fill="#f59e0b" opacity="0.4"/>
        </g>
        <circle className="sand-particle" cx="40" cy="36" r="1.5" fill="#d97706"/>
      </svg>
    </div>
    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
      Tu reserva expiró
    </h2>
    <p style={{ color: '#78716c', fontSize: '0.92rem', maxWidth: 300, lineHeight: 1.65, marginBottom: '2rem' }}>
      El tiempo para completar tu compra se agotó y los boletos fueron liberados. ¡Puedes intentarlo de nuevo!
    </p>
    <button
      onClick={onRetry}
      className="btn btn-primary btn-lg px-4"
      style={{ borderRadius: 10, boxShadow: '0 4px 14px rgba(13,110,253,0.25)' }}
    >
      Volver a seleccionar boletos →
    </button>
  </div>
)