export function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="tk-spinner"
      aria-label="Cargando..."
    />
  )
}
