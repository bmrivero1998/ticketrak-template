import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { CONFIG } from '@/config';
import HomePage from '@/pages/HomePage';
import EventDetailPage from '@/pages/EventDetailPage';
import CheckoutPage from '@/pages/CheckoutPage';
import SuccessPage from '@/pages/SuccessPage';
import { Header } from './components/layout/Header';
import AuthPage from './pages/AuthPage';
import VaultPage from './pages/VaultPage';
import { Footer } from './components/layout/Footer';

import DonatePage from './pages/DonatePage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LegalPage } from './pages/LegalPage';
import { ScrollToTop } from './components/ui/ScrollToTop';

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
          <ScrollToTop /> 
        <Header />
        <style>{dynamicStyles}</style>
        <Routes>
          {/* Páginas principales */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/evento/:slug" element={<Layout><EventDetailPage /></Layout>} />
          <Route path="/auth" element={<Layout><AuthPage /></Layout>} />
          <Route path="/vault" element={<Layout><VaultPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/success" element={<Layout><SuccessPage /></Layout>} />
          
          {/* Páginas legales */}
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/legal" element={<Layout><LegalPage /></Layout>} />
          
          {/* Donaciones */}
          <Route path="/donate" element={<Layout><DonatePage /></Layout>} />
          
          {/* 404 - Redirección */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer/>
      </CartProvider>
    </BrowserRouter>
  );
}
