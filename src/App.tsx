import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { Header } from '@/components/layout/Header'
import HomePage from '@/pages/HomePage'
import EventDetailPage from '@/pages/EventDetailPage'
import CheckoutPage from '@/pages/CheckoutPage'
import SuccessPage from '@/pages/SuccessPage'
import '@/styles/main.css'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="tk-main">{children}</main>
      <footer className="tk-footer">
        <p>Powered by <strong>Ticketrak</strong></p>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/success" element={<Layout><SuccessPage /></Layout>} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
