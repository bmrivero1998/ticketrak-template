import type { BillingDetails } from "../../../types" 

// ─── Paso 2: Datos de contacto ────────────────────────────────────────────────
interface StepContactProps {
  customerName: string
  contactNumber: string
  wantsInvoice: boolean
  billing: BillingDetails
  colonias: string[]
  loadingCP: boolean
  loading: boolean
  error: string | null
  onCustomerNameChange: (value: string) => void
  onContactNumberChange: (value: string) => void
  onWantsInvoiceChange: (value: boolean) => void
  onBillingChange: (billing: BillingDetails) => void
  onPostalCodeChange: (cp: string) => void
  onBack: () => void
  onNext: () => void
}

export const StepContact = ({
  customerName,
  contactNumber,
  wantsInvoice,
  billing,
  colonias,
  loadingCP,
  loading,
  error,
  onCustomerNameChange,
  onContactNumberChange,
  onWantsInvoiceChange,
  onBillingChange,
  onPostalCodeChange,
  onBack,
  onNext,
}: StepContactProps) => (
  <div className="card shadow-sm">
    <div className="card-body p-4">
      <button
        className="btn btn-link text-decoration-none ps-0 mb-3"
        onClick={onBack}
      >
        ← Volver
      </button>
      <h2 className="card-title h5 mb-4">Datos de Contacto</h2>

      <div className="mb-3">
        <label className="form-label fw-semibold">Nombre Completo</label>
        <input
          className="form-control"
          placeholder="Tu nombre"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Teléfono / WhatsApp</label>
        <input
          className="form-control"
          placeholder="+525512345678"
          maxLength={13}
          value={contactNumber}
          onChange={(e) => onContactNumberChange(e.target.value.replace(/\D/g, ''))}
          disabled={loading}
        />
      </div>

      <div className="border-top pt-3 mt-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="wantsInvoice"
            checked={wantsInvoice}
            onChange={(e) => onWantsInvoiceChange(e.target.checked)}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="wantsInvoice">
            Requiero Factura (RFC)
          </label>
        </div>
      </div>

      {wantsInvoice && (
        <div className="mt-3 d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">RFC</label>
              <input
                className="form-control"
                placeholder="XAXX010101000"
                value={billing.tax_id}
                onChange={(e) => onBillingChange({ ...billing, tax_id: e.target.value.toUpperCase() })}
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label">C.P.</label>
              <div className="position-relative">
                <input
                  className="form-control"
                  placeholder="00000"
                  maxLength={5}
                  value={billing.postal_code}
                  onChange={(e) => onPostalCodeChange(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                />
                {loadingCP && (
                  <span className="position-absolute end-0 top-50 translate-middle-y pe-3 text-muted small">
                    ...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Razón Social</label>
            <input
              className="form-control"
              placeholder="Nombre o Razón Social"
              value={billing.legal_name}
              onChange={(e) => onBillingChange({ ...billing, legal_name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">Estado</label>
              <input
                className={`form-control ${colonias.length > 0 ? 'bg-light' : ''}`}
                readOnly={colonias.length > 0}
                value={billing.state}
                onChange={(e) => onBillingChange({ ...billing, state: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Colonia</label>
              {colonias.length > 0 ? (
                <select
                  className="form-select"
                  value={billing.neighborhood}
                  onChange={(e) => onBillingChange({ ...billing, neighborhood: e.target.value })}
                  disabled={loading}
                >
                  <option value="">Selecciona...</option>
                  {colonias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  className="form-control"
                  placeholder="Colonia"
                  value={billing.neighborhood}
                  onChange={(e) => onBillingChange({ ...billing, neighborhood: e.target.value })}
                  disabled={loading}
                />
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Dirección (Calle y Número)</label>
            <input
              className="form-control"
              placeholder="Calle 123, Col. Centro"
              value={billing.address}
              onChange={(e) => onBillingChange({ ...billing, address: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}

      <button
        className="btn btn-primary w-100 btn-lg mt-4"
        onClick={onNext}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Preparando...
          </>
        ) : 'Reservar y continuar al pago →'}
      </button>
    </div>
  </div>
)