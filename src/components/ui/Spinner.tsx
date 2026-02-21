export function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div
      className="spinner-border text-primary"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando..."
    >
      <span className="visually-hidden">Cargando...</span>
    </div>
  )
}