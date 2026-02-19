import { Link, useNavigate } from 'react-router-dom'
import { CONFIG } from '@/config'
import { useCart } from '@/context/CartContext'

export function Header() {
  const { totalItems } = useCart()
  const navigate = useNavigate()

  return (
    <header className="tk-header">
      <div className="tk-header__inner">
        <Link to="/" className="tk-header__brand">
          {CONFIG.LOGO_URL ? (
            <img src={CONFIG.LOGO_URL} alt={CONFIG.BRAND_NAME} className="tk-header__logo" />
          ) : (
            <span className="tk-header__name">{CONFIG.BRAND_NAME}</span>
          )}
        </Link>

        <nav className="tk-header__nav">
          {CONFIG.ENABLE_VAULT && (
            <Link to="/vault" className="tk-header__link">
              Mis Boletos
            </Link>
          )}

          <button
            className="tk-header__cart"
            onClick={() => navigate(-1)}
            aria-label="Carrito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="tk-header__cart-badge">{totalItems}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
