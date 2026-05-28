import { Link } from 'react-router-dom'
import { LiaHandsHelpingSolid } from 'react-icons/lia'
import { HiOutlineArrowLeft } from 'react-icons/hi'

export default function DonatePage() {
  return (
    <div className="donate-page">
      <div className="donate-card">
        <div className="card-glow"></div>

        <div className="donate-header-icon">
          <LiaHandsHelpingSolid size={48} />
        </div>

        <h1>Apoya a Ticketrak</h1>

        <p className="description">
          Hecho por fans, para fans. Sin fees escondidos, sin transas.
          <br />
          Tu donación nos ayuda a seguir creciendo 🧡
        </p>

        {/* Botón de Stripe - igual que en SuccessPage */}
        <div className="stripe-container">
          <stripe-buy-button
            buy-button-id="buy_btn_1TbZKyLlq8dRY3gU2SQwffSZ"
            publishable-key="pk_live_51Rjrm1Llq8dRY3gU3hr6InTOsEvhoKdySXQp5Mx1duUZBRoFK9DkhTw1OGQTTIaNi0rYsvtUkhunpU4QVKypQu1v00uCU3SVUV"
          ></stripe-buy-button>
        </div>

        <p className="small-note">
          💳 Pago 100% seguro vía Stripe
        </p>

        <div className="actions">
          <Link to="/" className="back-button">
            <HiOutlineArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>

      <style>{`
        .donate-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background:
            radial-gradient(circle at top, rgba(99,102,241,0.12), transparent 35%),
            linear-gradient(to bottom, #f8fafc, #eef2ff);
        }

        .donate-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          text-align: center;
        }

        .card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 30%);
        }

        .donate-header-icon {
          width: 80px;
          height: 80px;
          background: rgba(99,102,241,0.12);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #4f46e5;
        }

        h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 16px;
          color: #111827;
        }

        .description {
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .stripe-container {
          margin: 16px 0;
        }

        .small-note {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 16px;
        }

        .actions {
          margin-top: 28px;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #f3f4f6;
          color: #374151;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}