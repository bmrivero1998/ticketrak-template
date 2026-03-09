// ─── Paso 3: Procesando reserva / sesión de pago ─────────────────────────────
interface StepProcessingProps {
  loading: boolean
  error: string | null
  activeReservationId: string | null
  onRetry: (reservationId: string) => void
}

export const StepProcessing = ({ loading, error, activeReservationId, onRetry }: StepProcessingProps) => (
  <div className="card shadow-sm">
    <div className="card-body p-5 text-center">
      {loading && (
        <>
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
          <h5 className="mb-2">Preparando tu pago...</h5>
          <p className="text-muted small">No cierres esta ventana.</p>
        </>
      )}
      {!loading && error && (
        <>
          <div className="text-danger mb-3" style={{ fontSize: '2.5rem' }}>✕</div>
          <h5 className="mb-2">Ocurrió un problema</h5>
          <p className="text-muted small mb-4">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => activeReservationId && onRetry(activeReservationId)}
            disabled={!activeReservationId}
          >
            Reintentar →
          </button>
        </>
      )}
    </div>
  </div>
)