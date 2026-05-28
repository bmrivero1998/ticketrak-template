// src/components/checkout/AgeVerificationModal.tsx
import { useState } from 'react'
import { BiCheckCircle, BiErrorCircle } from 'react-icons/bi'

interface AgeVerificationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onReject: () => void
}

export function AgeVerificationModal({ isOpen, onConfirm, onReject }: AgeVerificationModalProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!day || !month || !year) {
      setError('Completa todos los campos')
      return
    }

    const dayNum = parseInt(day)
    const monthNum = parseInt(month) - 1
    const yearNum = parseInt(year)

    if (dayNum < 1 || dayNum > 31) {
      setError('Día inválido')
      return
    }

    if (monthNum < 0 || monthNum > 11) {
      setError('Mes inválido')
      return
    }

    const birthDate = new Date(yearNum, monthNum, dayNum)
    const age = calculateAge(birthDate)

    if (age < 18) {
      setError('Necesitas tener al menos 18 años para comprar boletos.')
      return
    }

    // Guardar en sessionStorage para no volver a preguntar
    sessionStorage.setItem('age_verified', 'true')
    sessionStorage.setItem('age_verified_at', new Date().toISOString())
    onConfirm()
  }

  return (
    <div className="age-modal-overlay">
      <div className="age-modal">
        <div className="age-modal-content">
          <div className="age-modal-icon">
            🍺
          </div>

          <h2>¿Eres mayor de 18 años?</h2>

          <p className="age-modal-description">
            Para comprar boletos en Ticketrak, necesitamos confirmar que eres mayor de edad.
            <br />
            <strong>Es para cumplir con la ley, no es molestia.</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="age-modal-fields">
              <div className="age-field">
                <label>Día</label>
                <input
                  type="number"
                  placeholder="DD"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  min="1"
                  max="31"
                />
              </div>
              <div className="age-field">
                <label>Mes</label>
                <input
                  type="number"
                  placeholder="MM"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  min="1"
                  max="12"
                />
              </div>
              <div className="age-field">
                <label>Año</label>
                <input
                  type="number"
                  placeholder="AAAA"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {error && (
              <div className="age-modal-error">
                <BiErrorCircle size={16} />
                {error}
              </div>
            )}

            <div className="age-modal-buttons">
              <button type="button" className="age-btn-reject" onClick={onReject}>
                No, soy menor
              </button>
              <button type="submit" className="age-btn-confirm">
                Sí, confirmo
              </button>
            </div>
          </form>

          <p className="age-modal-footer">
            Al confirmar, declaras bajo protesta de decir verdad que eres mayor de 18 años.
          </p>
        </div>
      </div>

      <style>{`
        .age-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .age-modal {
          width: 100%;
          max-width: 480px;
          margin: 16px;
        }

        .age-modal-content {
          background: #1a1a1a;
          border-radius: 32px;
          padding: 32px 28px;
          text-align: center;
          border: 1px solid rgba(249, 115, 22, 0.3);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .age-modal-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .age-modal-content h2 {
          color: white;
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .age-modal-description {
          color: #9ca3af;
          font-size: 0.9rem;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .age-modal-fields {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .age-field {
          flex: 1;
          text-align: left;
        }

        .age-field label {
          display: block;
          color: #6b7280;
          font-size: 0.7rem;
          margin-bottom: 4px;
        }

        .age-field input {
          width: 100%;
          padding: 12px 8px;
          background: #0a0a0a;
          border: 1px solid #374151;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          text-align: center;
        }

        .age-field input:focus {
          outline: none;
          border-color: #f97316;
        }

        .age-modal-error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .age-modal-buttons {
          display: flex;
          gap: 12px;
        }

        .age-btn-reject {
          flex: 1;
          padding: 14px;
          background: transparent;
          border: 1px solid #374151;
          border-radius: 40px;
          color: #9ca3af;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .age-btn-reject:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .age-btn-confirm {
          flex: 1;
          padding: 14px;
          background: #f97316;
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .age-btn-confirm:hover {
          background: #ea580c;
          transform: translateY(-2px);
        }

        .age-modal-footer {
          color: #6b7280;
          font-size: 0.65rem;
          margin-top: 20px;
        }
      `}</style>
    </div>
  )
}