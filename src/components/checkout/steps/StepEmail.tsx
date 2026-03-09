import { CartSummary } from '../../../components/checkout/CartSummary'

// ─── Paso 1: Ingreso de correo ────────────────────────────────────────────────
interface StepEmailProps {
  email: string
  loading: boolean
  error: string | null
  onEmailChange: (value: string) => void
  onNext: () => void
}

export const StepEmail = ({ email, loading, error, onEmailChange, onNext }: StepEmailProps) => (
  <div className="card shadow-sm">
    <div className="card-body p-4">
      <h2 className="card-title h5 mb-1">¿Cuál es tu correo?</h2>
      <p className="text-muted small mb-4">
        Te enviaremos la confirmación y tus boletos aquí.
      </p>

      <div className="mb-4">
        <CartSummary />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label fw-semibold">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          className="form-control form-control-lg"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onNext()}
          disabled={loading}
          autoFocus
        />
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <button
        className="btn btn-primary w-100 btn-lg mt-2"
        onClick={onNext}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Verificando...
          </>
        ) : 'Continuar →'}
      </button>
    </div>
  </div>
)