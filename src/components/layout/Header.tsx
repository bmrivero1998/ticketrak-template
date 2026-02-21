import { Link, useNavigate } from 'react-router-dom'
import { CONFIG } from '@/config'
import { useCart } from '@/context/CartContext'

export function Header() {
  const { totalItems } = useCart()
  const navigate = useNavigate()

  return (
    <header className="border-bottom bg-white sticky-top shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">
        {/* Brand */}
        <Link to="/" className="text-decoration-none text-reset">
          {CONFIG.LOGO_URL ? (
            <img src={CONFIG.LOGO_URL} alt={CONFIG.BRAND_NAME} style={{ height: 32 }} />
          ) : (
            <span className="fw-bold fs-5">{CONFIG.BRAND_NAME}</span>
          )}
        </Link>

        {/* Nav */}
        <nav className="d-flex align-items-center gap-3">
          {CONFIG.ENABLE_VAULT && (
            <Link to="/vault" className="text-decoration-none text-muted small fw-medium">
              Mis Boletos
            </Link>
          )}

          <button
            className="btn btn-link text-reset p-0 position-relative"
            onClick={() => navigate(-1)}
            aria-label="Carrito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                style={{ fontSize: '0.6rem' }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}