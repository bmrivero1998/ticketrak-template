import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { CONFIG } from '@/config';
import HomePage from '@/pages/HomePage';
import EventDetailPage from '@/pages/EventDetailPage';
import CheckoutPage from '@/pages/CheckoutPage';
import SuccessPage from '@/pages/SuccessPage';

// --- HELPERS ---
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

// --- COMPONENTES DE DISEÑO ---
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ticketrak-container">
      <main className="container-fluid py-4" style={{ minHeight: '80vh' }}>
        {children}
      </main>

      <footer className="py-5 border-top text-center mt-5">
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
          Tecnología de boletaje por{' '}
          <a 
            href="https://info.metritrak.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-decoration-none fw-bold"
          >
            <span style={{ color: '#0d6efd' }}>Metri</span>
            <span style={{ color: '#fd7e14' }}>trak</span>
          </a>
        </p>
      </footer>
    </div>
  );
}

// Vista compacta para embeber como sección (solo 3 eventos)
function FeaturedSection() {
  // Aquí HomePage debería recibir una prop para limitar a 3 y emitir el click
  // o puedes manejar el evento click globalmente en el contenedor
  const handleWidgetClick = () => {
    const event = new CustomEvent('metritrak:go_to_store', {
      detail: { source: 'featured_widget' }
    });
    window.dispatchEvent(event);
    
    // Redirección al MFE completo (ajusta según tu ruta de producción)
    window.location.href = '/tienda'; 
  };

  return (
    <div onClick={handleWidgetClick} style={{ cursor: 'pointer' }}>
      <HomePage/>
    </div>
  );
}

// --- APP PRINCIPAL ---
interface AppProps {
  mode?: 'full' | 'featured';
}

export default function App({ mode = 'full' }: AppProps) {
  const theme = CONFIG.THEME;

  const dynamicStyles = `
    :root {
      --bs-primary: ${theme.PRIMARY};
      --bs-primary-rgb: ${hexToRgb(theme.PRIMARY)};
      --bs-secondary: ${theme.SECONDARY};
      --bs-secondary-rgb: ${hexToRgb(theme.SECONDARY)};
      --bs-body-bg: ${theme.BACKGROUND};
      --bs-body-color: ${theme.TEXT};
      --bs-secondary-color: ${theme.TEXT_SECONDARY};
      --tk-primary: ${theme.PRIMARY};
      --tk-bg: ${theme.BACKGROUND};
    }

    .btn-primary {
      --bs-btn-bg: var(--bs-primary);
      --bs-btn-border-color: var(--bs-primary);
      --bs-btn-hover-bg: var(--bs-primary);
      --bs-btn-hover-border-color: var(--bs-primary);
      --bs-btn-active-bg: var(--bs-primary);
      filter: brightness(0.95);
    }

    .btn-outline-primary {
      --bs-btn-color: var(--bs-primary);
      --bs-btn-border-color: var(--bs-primary);
    }

    .text-primary { color: var(--bs-primary) !important; }
    .text-muted { color: var(--bs-secondary-color) !important; }

    body { 
      background-color: var(--bs-body-bg);
      color: var(--bs-body-color);
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
  `;

  // MODO SECCIÓN (Featured 3 eventos)
  if (mode === 'featured') {
    return (
      <CartProvider>
        <style>{dynamicStyles}</style>
        <FeaturedSection />
      </CartProvider>
    );
  }

  // MODO FULL (Tienda completa)
  return (
    <BrowserRouter>
      <CartProvider>
        <style>{dynamicStyles}</style>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/success" element={<Layout><SuccessPage /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}