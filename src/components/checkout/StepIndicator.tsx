import { CONFIG } from '../../config'

// ─── Indicador de pasos ───────────────────────────────────────────────────────
interface StepIndicatorProps {
  currentStep: number
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = ['Correo', 'Datos', 'Reserva', 'Pago']
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        return (
          <div key={stepNum} className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32, height: 32, fontSize: 13,
                  backgroundColor: isDone ? '#198754' : isActive ? CONFIG.THEME.PRIMARY : '#dee2e6',
                  color: isDone || isActive ? '#fff' : '#6c757d',
                  transition: 'background-color 0.3s',
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <small
                className={`mt-1 ${isActive ? 'fw-semibold' : 'text-muted'}`}
                style={{ fontSize: 11, color: isActive ? CONFIG.THEME.PRIMARY : undefined }}
              >
                {label}
              </small>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="mb-3"
                style={{
                  width: 40, height: 2,
                  backgroundColor: isDone ? '#198754' : '#dee2e6',
                  transition: 'background-color 0.3s',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}