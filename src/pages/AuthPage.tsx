import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestVaultCode, vaultLogin } from '@/services/api'
import { Spinner } from '@/components/ui/Spinner'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // 🔑 Si ya hay token → directo al vault
  useEffect(() => {
    const token = localStorage.getItem('MT_FAN_TOKEN')
    if (token) navigate('/vault', { replace: true })
  }, [])

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestVaultCode(email)
      setStep(2)
    } catch {
      setError('No pudimos enviar el código. Revisa tu correo.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await vaultLogin(email, code)
      navigate('/vault', { replace: true })
    } catch {
      setError('El código es inválido o ya expiró.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');

        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Barlow', sans-serif;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          animation: cardIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* Header */
        .auth-header {
          padding: 32px 32px 24px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .auth-icon {
          font-size: 36px;
          line-height: 1;
          margin-bottom: 12px;
        }
        .auth-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.02em;
          margin: 0 0 4px;
        }
        .auth-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }

        /* Body */
        .auth-body {
          padding: 28px 32px 32px;
        }

        /* Step indicator */
        .auth-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .auth-step-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.25s;
        }
        .auth-step-dot.active {
          background: #fff;
          width: 24px;
          border-radius: 4px;
        }

        /* Label */
        .auth-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
          display: block;
        }

        /* Inputs */
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.06) !important;
          border: 1.5px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          color: #fff !important;
          font-family: 'Barlow', sans-serif !important;
          font-size: 15px !important;
          padding: 13px 16px !important;
          transition: border-color 0.2s, background 0.2s !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .auth-input:focus {
          border-color: rgba(255,255,255,0.35) !important;
          background: rgba(255,255,255,0.09) !important;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25) !important; }

        /* Code input — grande y centrado */
        .auth-input-code {
          font-family: 'Barlow Condensed', sans-serif !important;
          font-size: 32px !important;
          font-weight: 700 !important;
          letter-spacing: 0.25em !important;
          text-align: center !important;
          padding: 16px !important;
        }

        /* Hint */
        .auth-hint {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          text-align: center;
          margin-top: 10px;
        }
        .auth-hint strong { color: rgba(255,255,255,0.7); font-weight: 600; }

        /* Error */
        .auth-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: rgb(252,165,165);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: errIn 0.2s ease;
        }
        @keyframes errIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Submit button */
        .auth-btn {
          width: 100%;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #fff;
          color: #111;
          border: none;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }
        .auth-btn:hover:not(:disabled) { background: #f0f0f0; }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Back link */
        .auth-back {
          display: block;
          text-align: center;
          margin-top: 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
          font-family: 'Barlow', sans-serif;
        }
        .auth-back:hover { color: rgba(255,255,255,0.7); }

        /* Slide transition */
        .step-slide {
          animation: slideIn 0.28s cubic-bezier(0.25, 1, 0.5, 1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="auth-wrapper">
        <div className="auth-card">

          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon">🎟️</div>
            <h1 className="auth-title">Mis Boletos</h1>
            <p className="auth-subtitle">
              {step === 1 ? 'Ingresa tu correo para continuar' : 'Revisa tu bandeja de entrada'}
            </p>
          </div>

          {/* Body */}
          <div className="auth-body">

            {/* Step dots */}
            <div className="auth-steps">
              <div className={`auth-step-dot ${step === 1 ? 'active' : ''}`} />
              <div className={`auth-step-dot ${step === 2 ? 'active' : ''}`} />
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={step === 1 ? handleRequest : handleLogin}>
              <div className="step-slide" key={step}>
                {step === 1 ? (
                  <>
                    <label className="auth-label">Correo electrónico</label>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null) }}
                      required
                      autoFocus
                    />
                  </>
                ) : (
                  <>
                    <label className="auth-label">Código de 6 dígitos</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="auth-input auth-input-code"
                      placeholder="000000"
                      maxLength={6}
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(null) }}
                      autoFocus
                      required
                    />
                    <p className="auth-hint">
                      Enviamos el código a <strong>{email}</strong>
                    </p>
                  </>
                )}
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading
                  ? <Spinner size={18} />
                  : step === 1
                    ? <>Obtener código <span>→</span></>
                    : <>Acceder <span>→</span></>
                }
              </button>

              {step === 2 && (
                <button
                  type="button"
                  className="auth-back"
                  onClick={() => { setStep(1); setCode(''); setError(null) }}
                >
                  ← Cambiar correo
                </button>
              )}
            </form>

          </div>
        </div>
      </div>
    </>
  )
}