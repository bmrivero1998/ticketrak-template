import { BiCoffee } from 'react-icons/bi'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-black pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          {/* Columna 1 - La neta */}
          <div className="col-md-5">
            <div className="mb-3">
              <span className="fs-3 fw-black" style={{ letterSpacing: '-1px' }}>
                <span style={{ color: '#ffffff' }}>Ticket</span>
                <span style={{ color: '#f97316' }}>Trak</span>
              </span>
              <p className="text-white-50 mt-2" style={{ fontSize: '0.9rem' }}>
                Hecho por fans, para fans. <br />
                Sin transas, sin fees culeros.
              </p>
            </div>
          </div>

          {/* Columna 2 - Links rápidos */}
          <div className="col-md-4">
            <h6 className="text-white mb-3 fw-bold" style={{ fontSize: '0.85rem' }}>
              Directo
            </h6>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-white-50 text-decoration-none small hover-link">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white-50 text-decoration-none small hover-link">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-white-50 text-decoration-none small hover-link">
                  Mis boletos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3 - El pedo legal (qué hueva pero ni pedo) */}
          <div className="col-md-3">
            <h6 className="text-white mb-3 fw-bold" style={{ fontSize: '0.85rem' }}>
              Lo legal
            </h6>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2">
              <li className="text-white-50 small" style={{ fontSize: '0.8rem' }}>
                <span className="opacity-75">Ticketrak es parte de </span>
                <a 
                  href="https://info.metritrak.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  Metritrak
                </a>
                <span className="opacity-75"> 👍</span>
              </li>
              <li>
                <Link 
                  to="/legal" 
                  className="text-white-50 text-decoration-none small hover-link"
                >
                  Aviso Legal 
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-white-50 text-decoration-none small hover-link"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-white-50 text-decoration-none small hover-link"
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  to="/donate" 
                  className="text-white-50 text-decoration-none small hover-link"
                >
                  Regalanos un café <BiCoffee size={16} className="mb-1" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* El rollo de abajo */}
        <hr className="my-4 border-secondary border-opacity-25" />
        <div className="text-center">
          <p className="text-white-50 small m-0" style={{ fontSize: '0.7rem' }}>
            Hecho con 🧡 y mucha música • {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        .hover-link {
          transition: all 0.2s ease;
          display: inline-block;
        }
        
        .hover-link:hover {
          color: #f97316 !important;
          transform: translateX(4px);
        }
      `}</style>
    </footer>
  )
}